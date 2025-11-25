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
      range: "'Copy of Obligations'!B2:B",
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return new NextResponse(
        JSON.stringify({
          ors_numbers: [],
          message: "No ORS numbers found",
        }),
        { status: 204 }
      );
    }
    const cleanRows = rows.map((row) => row[0]).filter((item) => item);

    return new NextResponse(
      JSON.stringify({
        ors_numbers: cleanRows,
        message: "ORS numbers fetched successfully",
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        message: "Failed to fetch ORS numbers",
      }),
      { status: 500 }
    );
  }
}
