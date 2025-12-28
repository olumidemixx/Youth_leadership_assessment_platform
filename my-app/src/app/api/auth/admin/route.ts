import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = await req.json();
  if (code === "abc123") {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false });
}
