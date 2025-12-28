import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Retrieve current rating period settings
export async function GET() {
  try {
    // Get the most recent active rating period
    const activePeriod = await prisma.ratingPeriod.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ period: activePeriod });
  } catch (error) {
    console.error("Error fetching rating period:", error);
    return NextResponse.json({ error: "Failed to fetch rating period." }, { status: 500 });
  }
}

// POST: Create a new rating period
export async function POST(req: Request) {
  try {
    const { startDate, endDate } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required." },
        { status: 400 }
      );
    }

    // Parse dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    // Validate dates
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format." },
        { status: 400 }
      );
    }

    if (parsedStartDate >= parsedEndDate) {
      return NextResponse.json(
        { error: "End date must be after start date." },
        { status: 400 }
      );
    }

    // Create new rating period
    const newPeriod = await prisma.ratingPeriod.create({
      data: {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, period: newPeriod });
  } catch (error) {
    console.error("Error creating rating period:", error);
    return NextResponse.json(
      { error: "Failed to create rating period." },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing rating period
export async function PATCH(req: Request) {
  try {
    const { id, startDate, endDate, isActive } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Period ID is required." },
        { status: 400 }
      );
    }

    // Check if period exists
    const existingPeriod = await prisma.ratingPeriod.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPeriod) {
      return NextResponse.json(
        { error: "Rating period not found." },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (startDate !== undefined) {
      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid start date format." },
          { status: 400 }
        );
      }
      updateData.startDate = parsedStartDate;
    }

    if (endDate !== undefined) {
      const parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid end date format." },
          { status: 400 }
        );
      }
      updateData.endDate = parsedEndDate;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    // Validate start date is before end date if both are provided
    if (updateData.startDate && updateData.endDate) {
      if (updateData.startDate >= updateData.endDate) {
        return NextResponse.json(
          { error: "End date must be after start date." },
          { status: 400 }
        );
      }
    } else if (updateData.startDate && existingPeriod.endDate) {
      if (updateData.startDate >= existingPeriod.endDate) {
        return NextResponse.json(
          { error: "Start date must be before existing end date." },
          { status: 400 }
        );
      }
    } else if (updateData.endDate && existingPeriod.startDate) {
      if (existingPeriod.startDate >= updateData.endDate) {
        return NextResponse.json(
          { error: "End date must be after existing start date." },
          { status: 400 }
        );
      }
    }

    // Update the rating period
    const updatedPeriod = await prisma.ratingPeriod.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json({ success: true, period: updatedPeriod });
  } catch (error) {
    console.error("Error updating rating period:", error);
    return NextResponse.json(
      { error: "Failed to update rating period." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a rating period
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Period ID is required." },
        { status: 400 }
      );
    }

    // Check if period exists
    const existingPeriod = await prisma.ratingPeriod.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPeriod) {
      return NextResponse.json(
        { error: "Rating period not found." },
        { status: 404 }
      );
    }

    // Delete the rating period
    await prisma.ratingPeriod.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rating period:", error);
    return NextResponse.json(
      { error: "Failed to delete rating period." },
      { status: 500 }
    );
  }
}