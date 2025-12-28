import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH: update user role by email
export async function PATCH(req: Request) {
  try {
    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required." }, { status: 400 });
    }
    if (!['admin', 'feedback', 'user'].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role },
    });
    return NextResponse.json({ success: true, user: { email: updated.email, role: updated.role } });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update user role." }, { status: 500 });
  }
}
