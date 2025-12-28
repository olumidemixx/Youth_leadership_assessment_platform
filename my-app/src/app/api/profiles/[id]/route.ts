import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: fetch a single profile by ID
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: unknown) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
