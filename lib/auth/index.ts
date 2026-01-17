// Neon Auth (managed, limited features)
export { authClient } from "./client";

// Better Auth (full control, all features)
export { authClient as betterAuthClient } from "./better-client";
export { auth } from "./server";

// Re-export for convenience
export type { Session } from "./better-client";
