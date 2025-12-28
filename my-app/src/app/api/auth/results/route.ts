import { NextResponse } from "next/server";
import { ratingsStore } from "@/lib/ratingsStore";

// ratingsStore looks like:
// { "1": [q1, q2, q3, q4], "2": [q1, q2, q3, q4] }

export async function GET() {
  const q1s: number[] = [];
  const q2s: number[] = [];
  const q3s: number[] = [];
  const q4s: number[] = [];

  for (const scores of Object.values(ratingsStore)) {
    if (scores.length === 4) {
      q1s.push(scores[0]);
      q2s.push(scores[1]);
      q3s.push(scores[2]);
      q4s.push(scores[3]);
    }
  }

  return NextResponse.json({ q1s, q2s, q3s, q4s });
}
