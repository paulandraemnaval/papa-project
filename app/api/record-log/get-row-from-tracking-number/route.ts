import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tracking_number } = body;
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const service = google.sheets({ version: "v4", auth });
    const tracking_number_column = await service.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: "'Copy of RecordLog'!B2:B",
    });

    const tracking_number_rows = tracking_number_column.data.values;

    const rowIndex = tracking_number_rows?.findIndex(
      (row) => row[0] === tracking_number
    );

    if (rowIndex === -1 || rowIndex === undefined) {
      return NextResponse.json(
        { message: `Tracking Number ${tracking_number} not found` },
        { status: 404 }
      );
    }

    const actual_row_number = rowIndex + 2;
    const tracking_number_row = await service.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: `'Copy of RecordLog'!A${actual_row_number}:G${actual_row_number}`,
    });

    const row_found = tracking_number_row.data.values;

    console.log("row found", row_found);
    if (!row_found || row_found.length < 1) {
      return NextResponse.json(
        { message: `no row with tracking number ${tracking_number} found` },
        { status: 404 }
      );
    }

    const row_data = {
      payee: row_found[0][2],
      nature_of_transaction: row_found[0][3],
      allotment_class: row_found[0][4],
      legal_basis: row_found[0][5],
      amount: row_found[0][6],
    };

    return NextResponse.json(
      { data: row_data, message: "the following data has been found" },
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
