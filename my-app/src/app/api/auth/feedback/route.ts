import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = await req.json();
  if (code === "123abc") {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false });
}
