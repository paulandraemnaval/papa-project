import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      month,
      day,
      year,
      tracking_number,
      payee,
      nature_of_transaction,
      allotment_class,
      legal_basis,
      amount,
    } = body;

    const date_received = new Date(`${year}-${month}-${day}T00:00:00`);

    if (isNaN(date_received.getTime())) {
      return NextResponse.json(
        { message: "Invalid date. Please try again" },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const service = google.sheets({ version: "v4", auth });

    const values_for_record_sheet = [
      [
        new Date(date_received).toLocaleDateString("en-PH"),
        tracking_number,
        payee,
        nature_of_transaction,
        allotment_class,
        legal_basis,
        Number(amount),
      ],
    ];
    const record_sheet_requestBody = {
      values: values_for_record_sheet,
    };

    const values_for_summary_sheet = [
      [
        tracking_number,
        new Date(date_received).toLocaleDateString("en-PH"),
        null, // this column is the the date obligated column. It should be blank at record log creation
        payee,
        Number(amount),
        null, //this column is the days to obligate column. It should be blank at record log creation
        "Not Obligated", //Status column. Not obligated at record log creation
      ],
    ];
    const summary_sheet_requestBody = {
      values: values_for_summary_sheet,
    };
    const append_operations = [
      service.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: "'Copy of RecordLog'!A:G",
        valueInputOption: "USER_ENTERED",
        requestBody: record_sheet_requestBody,
      }),
      service.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: "'Copy of Summary_Record_vs_Obligation'!A:G",
        valueInputOption: "USER_ENTERED",
        requestBody: summary_sheet_requestBody,
      }),
    ];
    const responses = await Promise.all(append_operations);
    return NextResponse.json(
      {
        message: "Record Log submitted successfully!",
        responses,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error appending data to Google Sheet:", error);
    return NextResponse.json(
      { message: `Failed to record log: ${error.message}` },
      { status: 500 }
    );
  }
}
