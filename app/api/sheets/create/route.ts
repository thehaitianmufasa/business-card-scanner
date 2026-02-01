import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSpreadsheet } from "@/lib/google/sheets";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.error) {
    return NextResponse.json(
      { error: "Token refresh failed. Please sign in again." },
      { status: 401 }
    );
  }

  try {
    const { title } = await request.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Sheet title is required" },
        { status: 400 }
      );
    }

    const spreadsheet = await createSpreadsheet(session.accessToken, title);
    return NextResponse.json({ spreadsheet });
  } catch (error) {
    console.error("Create sheet error:", error);
    return NextResponse.json(
      { error: "Failed to create spreadsheet" },
      { status: 500 }
    );
  }
}
