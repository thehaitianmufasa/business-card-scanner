import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listUserSpreadsheets } from "@/lib/google/sheets";

export async function GET() {
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
    const spreadsheets = await listUserSpreadsheets(session.accessToken);
    return NextResponse.json({ spreadsheets });
  } catch (error) {
    console.error("List sheets error:", error);
    return NextResponse.json(
      { error: "Failed to list spreadsheets" },
      { status: 500 }
    );
  }
}
