// app/api/ratings/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> } // params is async
) {
  try {
    const { id } = await context.params; // ✅ await here
    const body = await req.json();
    const { scores, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required to submit a rating." },
        { status: 400 }
      );
    }

    if (!scores || !Array.isArray(scores) || scores.length !== 5) {
      return NextResponse.json(
        { error: "Scores must be an array of 5 numbers (Q1–Q5 averages)" },
        { status: 400 }
      );
    }

    // Validate that all scores are numbers
    if (!scores.every(score => typeof score === 'number' && !isNaN(score))) {
      return NextResponse.json(
        { error: "All scores must be valid numbers" },
        { status: 400 }
      );
    }

    // Check if profile exists before creating rating
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if current time is within the allowed rating period
    const now = new Date();
    const activePeriod = await prisma.ratingPeriod.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });

    if (!activePeriod) {
      return NextResponse.json(
        { error: "Rating submission is not available at this time. No active rating period has been set." },
        { status: 403 }
      );
    }

    const startDate = new Date(activePeriod.startDate);
    const endDate = new Date(activePeriod.endDate);

    if (now < startDate || now > endDate) {
      return NextResponse.json(
        {
          error: "Rating submission is not available at this time.",
          periodInfo: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            current: now.toISOString()
          }
        },
        { status: 403 }
      );
    }

    const rating = await prisma.rating.create({
      data: {
        profileId: Number(id),
        userId,
        q1: scores[0],
        q2: scores[1],
        q3: scores[2],
        q4: scores[3],
        q5: scores[4],
      },
    });

    return NextResponse.json({ success: true, rating });
  } catch (error: unknown) {
    console.error("POST /api/ratings/[id] error:", error);

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return NextResponse.json(
        { error: "Profile not found or invalid profile ID" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ await here

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const ratings = await prisma.rating.findMany({
      where: { profileId: Number(id) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ profileId: id, ratings });
  } catch (error: unknown) {
    console.error("GET /api/ratings/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

