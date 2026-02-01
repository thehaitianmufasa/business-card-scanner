import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { appendToSpreadsheet, ContactData } from "@/lib/google/sheets";

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
    const { spreadsheetId, data } = await request.json();

    if (!spreadsheetId || typeof spreadsheetId !== "string") {
      return NextResponse.json(
        { error: "Spreadsheet ID is required" },
        { status: 400 }
      );
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Contact data is required" },
        { status: 400 }
      );
    }

    const contactData: ContactData = {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      website: data.website || "",
      rawText: data.rawText || "",
    };

    await appendToSpreadsheet(session.accessToken, spreadsheetId, contactData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Append to sheet error:", error);
    return NextResponse.json(
      { error: "Failed to save contact" },
      { status: 500 }
    );
  }
}
