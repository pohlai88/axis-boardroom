// API route for Neon Auth - handlers are not available in current version
// TODO: Check @neondatabase/neon-js documentation for correct auth route setup
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Neon Auth route not configured" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: "Neon Auth route not configured" }, { status: 501 });
}
