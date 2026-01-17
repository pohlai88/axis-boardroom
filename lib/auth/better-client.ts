import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  
  plugins: [
    // Magic Link client
    magicLinkClient(),
    
    // Add more client plugins as needed:
    // twoFactorClient(),
    // passkeyClient(),
    // organizationClient(),
  ],
});

// Export session type for TypeScript
export type Session = typeof authClient.$Infer.Session;
