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

    const request = await service.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: `'Copy of Summary_Record_vs_Obligation'!A2:G`,
    });

    const values = request.data.values;

    if (values === null || values === undefined) {
      return NextResponse.json(
        {
          data: null,
          message: "No data found in Record vs Obligation Sheet",
        },
        { status: 204 }
      );
    }

    const keys = [
      "tracking_no",
      "date_received",
      "date_obligated",
      "payee",
      "amount",
      "days_to_obligate",
      "status",
    ];

    const values_object = values.map((row) =>
      Object.fromEntries(keys.map((key, index) => [key, row[index]]))
    );

    return NextResponse.json(
      {
        data: values_object,
        message: "The following rows are found in Record vs Obligation Sheet",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        data: null,
        message: `an error has occured: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
