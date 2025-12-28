import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: returns user and rater stats
export async function GET() {
  try {
    // Count all users
    const userCount = await prisma.user.count();
    // Count distinct users who have submitted at least one rating
    const raters = await prisma.rating.findMany({ select: { id: true, profileId: true } });
    // Each rating is linked to a profile; we want users who have submitted at least one rating
    // But we don't have userId in Rating, so we assume: each rating is a feedback for a profile, and the rater is the user who submitted it
    // If you want to count users who have submitted at least one rating, you need a userId field in Rating
    // For now, count the number of ratings (i.e., number of times anyone has rated any candidate)
    const ratingCount = await prisma.rating.count();
    return NextResponse.json({ userCount, ratingCount });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
