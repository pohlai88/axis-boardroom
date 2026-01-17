import { auth } from "@/lib/auth/server";

// Better Auth automatically provides handler function
const handler = auth.handler;

export const GET = handler;
export const POST = handler;
