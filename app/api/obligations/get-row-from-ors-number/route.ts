import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ORSNumber: ors_number } = body;
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const service = google.sheets({ version: "v4", auth });
    const ors_number_column = await service.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: "'Copy of Obligations'!B2:B",
    });

    const ors_number_rows = ors_number_column.data.values;

    const rowIndex = ors_number_rows?.findIndex((row) => row[0] === ors_number);

    if (rowIndex === -1 || rowIndex === undefined) {
      return NextResponse.json({
        message: `ORS Number ${ors_number} not found`,
      });
    }

    const actual_row_number = rowIndex + 2;
    const ors_number_row = await service.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: `'Copy of Obligations'!A${actual_row_number}:I${actual_row_number}`,
    });

    const row_found = ors_number_row.data.values;

    if (!row_found || row_found.length < 1) {
      return NextResponse.json(
        {
          message: `no row with ORS number ${ors_number} found`,
        },
        { status: 404 }
      );
    }

    const row_data = {
      payee: row_found[0][3] as string,
      nature_of_transaction: row_found[0][4] as string,
      amount_obligated: row_found[0][8] as number,
    };

    return NextResponse.json(
      {
        data: row_data,
        message: "the following data has been found",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "error getting row of tracking number",
      },
      { status: 500 }
    );
  }
}
