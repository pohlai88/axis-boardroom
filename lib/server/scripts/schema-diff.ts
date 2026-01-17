#!/usr/bin/env tsx
/**
 * Schema Diff Tool
 * 
 * Detects breaking changes between schema versions.
 * Compares current schemas with previous versions to identify:
 * - New schemas added
 * - Fields added/removed
 * - Type changes
 * - Breaking vs non-breaking changes
 * 
 * Usage:
 *   npm run schema:diff main feature-branch
 *   npm run schema:diff HEAD~1 HEAD
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface SchemaDiff {
  schema: string;
  change: "added" | "removed" | "modified";
  breaking: boolean;
  details: string[];
}

/**
 * Extract schemas from a file
 */
function extractSchemas(filePath: string): Map<string, string> {
  const schemas = new Map<string, string>();
  
  if (!existsSync(filePath)) {
    return schemas;
  }
  
  const content = readFileSync(filePath, "utf-8");
  
  // Simple regex to find exported schemas
  // This is a basic implementation - could be enhanced with AST parsing
  const schemaRegex = /export\s+(?:const|function)\s+(\w+Schema)\s*=/g;
  let match;
  
  while ((match = schemaRegex.exec(content)) !== null) {
    const schemaName = match[1];
    // Extract the schema definition (simplified)
    schemas.set(schemaName, content);
  }
  
  return schemas;
}

/**
 * Compare two schema files
 */
function compareSchemas(
  oldFile: string,
  newFile: string,
  filePath: string
): SchemaDiff[] {
  const diffs: SchemaDiff[] = [];
  
  const oldSchemas = extractSchemas(oldFile);
  const newSchemas = extractSchemas(newFile);
  
  // Find added schemas
  for (const [name] of newSchemas) {
    if (!oldSchemas.has(name)) {
      diffs.push({
        schema: `${filePath}:${name}`,
        change: "added",
        breaking: false, // Adding schemas is non-breaking
        details: [`New schema '${name}' added`],
      });
    }
  }
  
  // Find removed schemas
  for (const [name] of oldSchemas) {
    if (!newSchemas.has(name)) {
      diffs.push({
        schema: `${filePath}:${name}`,
        change: "removed",
        breaking: true, // Removing schemas is breaking
        details: [`Schema '${name}' removed`],
      });
    }
  }
  
  // Find modified schemas (simplified - would need AST parsing for full comparison)
  for (const [name] of newSchemas) {
    if (oldSchemas.has(name)) {
      const oldContent = oldSchemas.get(name)!;
      const newContent = newSchemas.get(name)!;
      
      if (oldContent !== newContent) {
        // This is a simplified check - full comparison would require AST parsing
        diffs.push({
          schema: `${filePath}:${name}`,
          change: "modified",
          breaking: true, // Assume breaking until proven otherwise
          details: [`Schema '${name}' has been modified`],
        });
      }
    }
  }
  
  return diffs;
}

/**
 * Get schema files from git
 */
function getSchemaFilesFromGit(ref: string): string[] {
  try {
    const output = execSync(
      `git ls-tree -r --name-only ${ref} -- lib/contracts/`,
      { encoding: "utf-8" }
    );
    
    return output
      .split("\n")
      .filter(line => line.endsWith(".contract.ts") || line.endsWith(".contract.tsx"))
      .filter(line => line.length > 0);
  } catch (error) {
    console.error(`Error getting files from git ref ${ref}:`, error);
    return [];
  }
}

/**
 * Get file content from git
 */
function getFileFromGit(ref: string, filePath: string): string | null {
  try {
    return execSync(`git show ${ref}:${filePath}`, { encoding: "utf-8" });
  } catch (error) {
    return null;
  }
}

/**
 * Main diff function
 */
function diffSchemas(oldRef: string, newRef: string): SchemaDiff[] {
  const allDiffs: SchemaDiff[] = [];
  
  const oldFiles = getSchemaFilesFromGit(oldRef);
  const newFiles = getSchemaFilesFromGit(newRef);
  
  const allFiles = new Set([...oldFiles, ...newFiles]);
  
  for (const file of allFiles) {
    const oldContent = getFileFromGit(oldRef, file);
    const newContent = getFileFromGit(newRef, file);
    
    if (!oldContent && newContent) {
      // New file
      allDiffs.push({
        schema: file,
        change: "added",
        breaking: false,
        details: [`New file '${file}' added`],
      });
    } else if (oldContent && !newContent) {
      // Removed file
      allDiffs.push({
        schema: file,
        change: "removed",
        breaking: true,
        details: [`File '${file}' removed`],
      });
    } else if (oldContent && newContent) {
      // Modified file
      const fileDiffs = compareSchemas(oldContent, newContent, file);
      allDiffs.push(...fileDiffs);
    }
  }
  
  return allDiffs;
}

/**
 * Format diff output
 */
function formatDiff(diffs: SchemaDiff[]): string {
  if (diffs.length === 0) {
    return "✅ No schema changes detected";
  }
  
  const breaking = diffs.filter(d => d.breaking);
  const nonBreaking = diffs.filter(d => !d.breaking);
  
  let output = `\n📊 Schema Diff Results\n`;
  output += `═══════════════════════════════════════\n\n`;
  
  if (breaking.length > 0) {
    output += `❌ Breaking Changes (${breaking.length}):\n`;
    for (const diff of breaking) {
      output += `  • ${diff.schema} - ${diff.change}\n`;
      for (const detail of diff.details) {
        output += `    ${detail}\n`;
      }
    }
    output += `\n`;
  }
  
  if (nonBreaking.length > 0) {
    output += `✅ Non-Breaking Changes (${nonBreaking.length}):\n`;
    for (const diff of nonBreaking) {
      output += `  • ${diff.schema} - ${diff.change}\n`;
      for (const detail of diff.details) {
        output += `    ${detail}\n`;
      }
    }
    output += `\n`;
  }
  
  output += `═══════════════════════════════════════\n`;
  output += `Total Changes: ${diffs.length}\n`;
  output += `Breaking: ${breaking.length}\n`;
  output += `Non-Breaking: ${nonBreaking.length}\n`;
  
  return output;
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error("Usage: npm run schema:diff <old-ref> <new-ref>");
    console.error("Example: npm run schema:diff main feature-branch");
    process.exit(1);
  }
  
  const [oldRef, newRef] = args;
  
  console.log(`Comparing schemas: ${oldRef} → ${newRef}\n`);
  
  const diffs = diffSchemas(oldRef, newRef);
  const output = formatDiff(diffs);
  
  console.log(output);
  
  // Exit with error code if breaking changes found
  const hasBreaking = diffs.some(d => d.breaking);
  if (hasBreaking) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { diffSchemas, formatDiff, type SchemaDiff };
