import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const service = google.sheets({ version: "v4", auth });

    const response = await service.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: "'Copy of RecordLog'!B2:B",
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return new NextResponse(
        JSON.stringify({
          tracking_numbers: [],
          message: "No tracking numbers found",
        }),
        { status: 204 }
      );
    }
    const cleanRows = rows.map((row) => row[0]).filter((item) => item);

    return new NextResponse(
      JSON.stringify({
        tracking_numbers: cleanRows,
        message: "Tracking numbers fetched successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tracking numbers:", error);
    return new NextResponse(
      JSON.stringify({ message: "Failed to fetch tracking numbers" }),
      { status: 500 }
    );
  }
}
