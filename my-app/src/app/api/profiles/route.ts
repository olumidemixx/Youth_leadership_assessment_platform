import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: fetch all profiles
export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(profiles);
  } catch (error: any) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

// POST: create new profile
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, photoUrl } = body;

    const newProfile = await prisma.profile.create({
      data: { firstName, lastName, photoUrl },
    });

    return NextResponse.json(newProfile, { status: 201 });
  } catch (error: any) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
