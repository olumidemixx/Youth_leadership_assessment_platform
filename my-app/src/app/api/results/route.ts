import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mean, standardDeviation } from 'simple-statistics';

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      include: { ratings: { orderBy: { createdAt: "desc" } } },
    });

    const results = profiles.map((p) => {
      // Calculate aggregated averages for each dimension
      const ratings = p.ratings;
      const raterCount = ratings.length;
      
      if (raterCount === 0) {
        return {
          profile: {
            id: p.id,
            firstName: p.firstName,
            lastName: p.lastName,
          },
          aggregatedScores: {
            q1: 0,
            q2: 0,
            q3: 0,
            q4: 0,
            q5: 0,
          },
          globalAuthenticLeadership: 0,
          raterCount: 0,
          zScores: {
            q1: 0,
            q2: 0,
            q3: 0,
            q4: 0,
            q5: 0,
          },
        };
      }

      // Sum all scores for each dimension
      const sums = ratings.reduce(
        (acc, rating) => {
          acc.q1 += rating.q1;
          acc.q2 += rating.q2;
          acc.q3 += rating.q3;
          acc.q4 += rating.q4;
          acc.q5 += rating.q5;
          return acc;
        },
        { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 }
      );

      // Calculate averages
      const aggregatedScores = {
        q1: sums.q1 / raterCount,
        q2: sums.q2 / raterCount,
        q3: sums.q3 / raterCount,
        q4: sums.q4 / raterCount,
        q5: sums.q5 / raterCount,
      };

      // Calculate global authentic leadership score (average of q1-q4)
      const globalAuthenticLeadership = (aggregatedScores.q1 + aggregatedScores.q2 + aggregatedScores.q3 + aggregatedScores.q4) / 4;

      return {
        profile: {
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
        },
        aggregatedScores,
        globalAuthenticLeadership,
        raterCount,
        zScores: {
          q1: 0, // Will be calculated after we have all candidates' means
          q2: 0,
          q3: 0,
          q4: 0,
          q5: 0,
        },
      };
    });

    // Filter out candidates with no ratings for statistical calculations
    const validResults = results.filter(r => r.raterCount > 0);

    // Calculate overall means for each dimension
    const overallMeans = {
      q1: mean(validResults.map(r => r.aggregatedScores.q1)),
      q2: mean(validResults.map(r => r.aggregatedScores.q2)),
      q3: mean(validResults.map(r => r.aggregatedScores.q3)),
      q4: mean(validResults.map(r => r.aggregatedScores.q4)),
      q5: mean(validResults.map(r => r.aggregatedScores.q5)),
    };

    // Calculate standard deviations for each dimension
    const standardDeviations = {
      q1: standardDeviation(validResults.map(r => r.aggregatedScores.q1)),
      q2: standardDeviation(validResults.map(r => r.aggregatedScores.q2)),
      q3: standardDeviation(validResults.map(r => r.aggregatedScores.q3)),
      q4: standardDeviation(validResults.map(r => r.aggregatedScores.q4)),
      q5: standardDeviation(validResults.map(r => r.aggregatedScores.q5)),
    };

    // Calculate z-scores for each candidate
    const resultsWithZScores = results.map(result => {
      if (result.raterCount === 0) {
        return result; // Keep z-scores as 0 for candidates with no ratings
      }

      const zScores = {
        q1: standardDeviations.q1 === 0 ? 0 : (result.aggregatedScores.q1 - overallMeans.q1) / standardDeviations.q1,
        q2: standardDeviations.q2 === 0 ? 0 : (result.aggregatedScores.q2 - overallMeans.q2) / standardDeviations.q2,
        q3: standardDeviations.q3 === 0 ? 0 : (result.aggregatedScores.q3 - overallMeans.q3) / standardDeviations.q3,
        q4: standardDeviations.q4 === 0 ? 0 : (result.aggregatedScores.q4 - overallMeans.q4) / standardDeviations.q4,
        q5: standardDeviations.q5 === 0 ? 0 : (result.aggregatedScores.q5 - overallMeans.q5) / standardDeviations.q5,
      };

      return {
        ...result,
        zScores,
      };
    });

    // Include statistical summary in the response
    const statisticalSummary = {
      overallMeans,
      standardDeviations,
      sampleSize: validResults.length,
    };

    return NextResponse.json({
      results: resultsWithZScores,
      statistics: statisticalSummary,
    });
  } catch (error) {
    console.error("GET /api/results error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
