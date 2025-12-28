import { NextResponse } from "next/server";

export async function POST() {
  // No secret code needed for User role
  return NextResponse.json({ success: true });
}
