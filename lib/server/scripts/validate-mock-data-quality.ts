/**
 * Mock Data Quality Validation Script
 * 
 * Generates mock data from Zod schemas using zod-schema-faker
 * and validates quality by inserting into Neon database
 * 
 * Usage: tsx lib/server/scripts/validate-mock-data-quality.ts
 */

import { setFaker, fake, seed } from "zod-schema-faker/v4";
import { faker } from "@faker-js/faker";
import { taskSchema, insertTaskSchema } from "@/lib/contracts/entities/task.contract";
import { z } from "zod";

// Setup zod-schema-faker for Zod v4
setFaker(faker);

// Set seed for reproducible results
seed(42);

/**
 * Generate mock data from a schema and validate it
 */
function generateAndValidate<T extends z.ZodType>(
  schema: T,
  count: number = 10
): { generated: z.infer<T>[]; valid: number; invalid: number; errors: string[] } {
  const generated: z.infer<T>[] = [];
  const errors: string[] = [];
  let valid = 0;
  let invalid = 0;

  console.log(`\n📊 Generating ${count} mock records from schema...`);

  for (let i = 0; i < count; i++) {
    try {
      // Generate fake data
      const mockData = fake(schema);
      
      // Validate against schema
      const result = schema.safeParse(mockData);
      
      if (result.success) {
        generated.push(result.data);
        valid++;
        console.log(`  ✅ Record ${i + 1}: Valid`);
      } else {
        invalid++;
        const errorMsg = `Record ${i + 1}: ${result.error.issues.map(issue => issue.message).join(", ")}`;
        errors.push(errorMsg);
        console.log(`  ❌ ${errorMsg}`);
      }
    } catch (error) {
      invalid++;
      const errorMsg = `Record ${i + 1}: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      console.log(`  ❌ ${errorMsg}`);
    }
  }

  return { generated, valid, invalid, errors };
}

/**
 * Analyze data quality metrics
 */
function analyzeQuality(
  data: unknown[],
  schema: z.ZodType
): {
  completeness: number;
  diversity: number;
  typeSafety: number;
  issues: string[];
} {
  const issues: string[] = [];
  let completenessScore = 0;
  let typeSafetyScore = 0;
  const uniqueValues = new Set<string>();

  data.forEach((item, index) => {
    // Check completeness (all required fields present)
    const validation = schema.safeParse(item);
    if (validation.success) {
      completenessScore++;
      typeSafetyScore++;
    } else {
      issues.push(`Item ${index + 1}: ${validation.error.issues.map(i => i.message).join(", ")}`);
    }

    // Check diversity (unique values)
    const itemStr = JSON.stringify(item);
    uniqueValues.add(itemStr);
  });

  const completeness = (completenessScore / data.length) * 100;
  const diversity = (uniqueValues.size / data.length) * 100;
  const typeSafety = (typeSafetyScore / data.length) * 100;

  return {
    completeness,
    diversity,
    typeSafety,
    issues,
  };
}

/**
 * Main validation function
 */
async function main() {
  console.log("🚀 Starting Mock Data Quality Validation");
  console.log("=" .repeat(60));

  // Test Task Schema
  console.log("\n📋 Testing Task Schema");
  console.log("-".repeat(60));
  
  const taskResults = generateAndValidate(insertTaskSchema, 20);
  const taskQuality = analyzeQuality(taskResults.generated, insertTaskSchema);

  console.log("\n📈 Quality Metrics:");
  console.log(`  Completeness: ${taskQuality.completeness.toFixed(1)}%`);
  console.log(`  Diversity: ${taskQuality.diversity.toFixed(1)}%`);
  console.log(`  Type Safety: ${taskQuality.typeSafety.toFixed(1)}%`);
  console.log(`  Valid Records: ${taskResults.valid}/${taskResults.valid + taskResults.invalid}`);
  
  if (taskQuality.issues.length > 0) {
    console.log("\n⚠️  Issues Found:");
    taskQuality.issues.slice(0, 5).forEach(issue => console.log(`  - ${issue}`));
    if (taskQuality.issues.length > 5) {
      console.log(`  ... and ${taskQuality.issues.length - 5} more`);
    }
  }

  // Sample output
  if (taskResults.generated.length > 0) {
    console.log("\n📝 Sample Generated Data:");
    console.log(JSON.stringify(taskResults.generated[0], null, 2));
  }

  // Overall assessment
  console.log("\n" + "=".repeat(60));
  console.log("🎯 Overall Assessment:");
  
  const overallScore = (taskQuality.completeness + taskQuality.diversity + taskQuality.typeSafety) / 3;
  
  if (overallScore >= 95) {
    console.log("  ✅ EXCELLENT: Mock data quality is production-ready");
  } else if (overallScore >= 85) {
    console.log("  ✅ GOOD: Mock data quality is acceptable with minor improvements needed");
  } else if (overallScore >= 70) {
    console.log("  ⚠️  FAIR: Mock data quality needs improvement");
  } else {
    console.log("  ❌ POOR: Mock data quality is insufficient");
  }
  
  console.log(`  Overall Score: ${overallScore.toFixed(1)}%`);
  console.log("=".repeat(60));
}

// Run validation
main().catch(console.error);
