import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { content } = await req.json();
  // In production, tie to logged-in user (next-auth session)
  await prisma.submission.create({
    data: { content, userId: 1 }, // placeholder user for now
  });
  return NextResponse.json("Submission saved!");
}
