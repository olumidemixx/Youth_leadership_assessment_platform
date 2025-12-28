import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Check if email has ratings
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const ratings = await prisma.rating.findMany({ where: { userId: user.id } });
  return NextResponse.json({ hasRatings: ratings.length > 0, ratings });
}

// DELETE: Remove all ratings by email
export async function DELETE(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const deleted = await prisma.rating.deleteMany({ where: { userId: user.id } });
  // Optionally, log deletions in a separate table for audit
  return NextResponse.json({ deletedCount: deleted.count });
}
