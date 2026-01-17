import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import drizzlePlugin from "eslint-plugin-drizzle";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Drizzle ESLint Plugin (flat config format)
  // Reference: https://orm.drizzle.team/docs/eslint-plugin
  {
    plugins: {
      drizzle: drizzlePlugin,
    },
    rules: {
      // Enforce WHERE clauses on DELETE and UPDATE operations
      // Only checks objects named 'db' (our Drizzle database instance)
      "drizzle/enforce-delete-with-where": [
        "error",
        {
          drizzleObjectName: "db", // Only check 'db' object (from @/lib/server/drizzle)
        },
      ],
      "drizzle/enforce-update-with-where": [
        "error",
        {
          drizzleObjectName: "db", // Only check 'db' object (from @/lib/server/drizzle)
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rule overrides
  {
    rules: {
      // Disable no-explicit-any - too noisy for API routes and utility functions
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // ============================================
  // AXIS Zone-Aware Boundary Rules
  // ============================================
  
  // _internal/composites: can use primitives, cannot use _internal/ui directly
  {
    files: ["components/_internal/composites/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { 
              group: ["@/components/_internal/ui/*"], 
              message: "Composites cannot import from _internal/ui/*. Use @/components/primitives." 
            },
          ],
        },
      ],
    },
  },
  // _internal/micro: can use primitives, cannot use _internal/ui directly
  {
    files: ["components/_internal/micro/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { 
              group: ["@/components/_internal/ui/*"], 
              message: "Micro components cannot import from _internal/ui/*. Use @/components/primitives." 
            },
          ],
        },
      ],
    },
  },
  // ============================================
  // Route Zone Rules
  // ============================================
  
  // (prod) zone: STRICT - cannot import _internal/* at all
  // Must use @/components/axis or @/components/primitives
  // Note: \\( escapes parentheses for minimatch glob engine
  {
    files: ["app/\\(prod\\)/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { 
              group: ["@/components/_internal/*"], 
              message: "Prod routes cannot import _internal/* directly. Use @/components/axis or @/components/primitives." 
            },
          ],
        },
      ],
    },
  },
  // (lab) zone: UNRESTRICTED - can import anything
  // Developers can experiment freely here
  // No restrictions for app/(lab)/**
  
  // (demo) zone: TEACHING - warn on _internal/*
  // Should demonstrate proper axis usage
  {
    files: ["app/\\(demo\\)/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            { 
              group: ["@/components/_internal/*"], 
              message: "Demo routes should prefer @/components/axis exports for teaching purposes." 
            },
          ],
        },
      ],
    },
  },
  // Default app routes (fallback): warn on _internal/*
  {
    files: ["app/**/*.{ts,tsx}"],
    ignores: ["app/\\(prod\\)/**", "app/\\(lab\\)/**", "app/\\(demo\\)/**"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            { 
              group: ["@/components/_internal/*"], 
              message: "Prefer @/components/axis or @/components/primitives." 
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
