import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { magicLink } from "better-auth/plugins";

// Connect directly to your Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use the neon_auth schema that already exists
  options: "-c search_path=neon_auth,public",
});

export const auth = betterAuth({
  database: pool,
  
  // Base URL for authentication
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  
  // Email & Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
  },
  
  // Social providers (use your Neon Auth OAuth credentials)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    // Add more providers as needed
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (refresh session every day)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },
  
  // Enable advanced features through plugins
  plugins: [
    // Magic Link (passwordless authentication)
    magicLink({
      expiresIn: 60 * 5, // 5 minutes
      sendMagicLink: async ({ email, url, token }) => {
        // TODO: Send email with magic link
        // You can use any email service (Resend, SendGrid, etc.)
        console.log(`Magic link for ${email}: ${url}`);
        console.log(`Token: ${token}`);
        
        // Example with console (replace with actual email service):
        // await sendEmail({
        //   to: email,
        //   subject: "Sign in to AXIS BoardRoom",
        //   html: `<a href="${url}">Click here to sign in</a>`
        // });
      },
    }),
    
    // Add more plugins as needed:
    // twoFactor(),
    // passkey(),
    // organization(),
  ],
  
  // Advanced configuration
  advanced: {
    cookiePrefix: "axis",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

// Export type for client inference
export type Auth = typeof auth;
