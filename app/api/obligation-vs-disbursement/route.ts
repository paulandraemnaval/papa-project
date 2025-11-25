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
      range: `'Copy of Summary_Obligation_vs_Disbursement'!A2:E`,
    });

    const values = request.data.values;

    if (values === null || values === undefined) {
      return NextResponse.json(
        {
          data: null,
          message: "No data found in Obligation vs Disbursement Sheet",
        },
        { status: 204 }
      );
    }

    const keys = [
      "ors_number",
      "payee",
      "amount_obligated",
      "total_disbursed",
      "balance",
    ];

    const values_object = values.map((row) =>
      Object.fromEntries(keys.map((key, index) => [key, row[index]]))
    );

    return NextResponse.json(
      {
        data: values_object,
        message:
          "The following rows are found in Obligation vs Disbursement Sheet",
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
