import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

function getDayDifference(futureDate: Date, pastDate: Date): number {
  const time1 = futureDate.getTime();
  const time2 = pastDate.getTime();

  console.log(`time 1 ${time1}, time 2 ${time2}`);
  const diffMiliseconds = Math.abs(time2 - time1);
  const milisPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor(diffMiliseconds / milisPerDay);
  return diffDays;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tracking_number,
      ors_no,
      day,
      month,
      year,
      payee,
      nature_of_transaction,
      allotment_class,
      legal_basis,
      amount,
      amount_obligated,
    } = body;

    const date = new Date(`${year}-${month}-${day}T00:00:00`);

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
      range: "'Copy of Summary_Record_vs_Obligation'!A2:A",
    });
    const tracking_number_rows = tracking_number_column.data.values;
    const rowIndex = tracking_number_rows?.findIndex(
      (row) => row[0] === tracking_number
    );
    if (rowIndex === -1 || rowIndex === undefined) {
      return NextResponse.json(
        {
          message: `Tracking Number ${tracking_number} not found in summary record vs obligation sheet`,
        },
        { status: 404 }
      );
    }
    const summary_row_number = rowIndex + 2;

    const summary_date_received_request = await service.spreadsheets.values.get(
      {
        spreadsheetId: process.env.SHEET_ID,
        range: `'Copy of Summary_Record_vs_Obligation'!B${summary_row_number}`,
      }
    );

    const summary_date_received = summary_date_received_request.data.values;

    if (summary_date_received === null || summary_date_received === undefined) {
      return NextResponse.json(
        {
          message: `Date received of ${tracking_number} (row ${summary_row_number}) was not found`,
        },
        { status: 404 }
      );
    }

    const summary_date: Date = new Date(summary_date_received[0][0]);

    if (isNaN(summary_date.getTime())) {
      return NextResponse.json(
        {
          message: `Summary date is not a date. Got ${summary_date_received[0][0]}`,
        },
        { status: 500 }
      );
    }

    const date_obligated = new Date(date);

    const days_to_obligate = getDayDifference(date_obligated, summary_date);

    const obligation_sheet_values = [
      [
        tracking_number,
        ors_no,
        new Date(date).toLocaleDateString("en-PH"),
        payee,
        nature_of_transaction,
        allotment_class,
        legal_basis,
        parseFloat(amount).toFixed(2),
        parseFloat(amount_obligated).toFixed(2),
      ],
    ];
    const obligation_sheet_requestBody = {
      values: obligation_sheet_values,
    };

    const summary_sheet_request_values = {
      data: [
        {
          range: `'Copy of Summary_Record_vs_Obligation'!C${summary_row_number}`,
          values: [[new Date(date).toLocaleDateString("en-PH")]],
        },
        {
          range: `'Copy of Summary_Record_vs_Obligation'!F${summary_row_number}`,
          values: [[days_to_obligate]],
        },
        {
          range: `'Copy of Summary_Record_vs_Obligation'!G${summary_row_number}`,
          values: [["Obligated"]],
        },
      ],
      valueInputOption: "USER_ENTERED",
    };

    const append_operations = [
      service.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: "'Copy of Obligations'!A:I",
        valueInputOption: "USER_ENTERED",
        requestBody: obligation_sheet_requestBody,
      }),
      service.spreadsheets.values.batchUpdate({
        spreadsheetId: process.env.SHEET_ID,

        requestBody: summary_sheet_request_values,
      }),
    ];
    const result = await Promise.all(append_operations);

    return NextResponse.json(
      { message: "Obligation log added successfully", result },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error appending data to google sheet: ", error);
    return NextResponse.json(
      { message: `Failed to record log: ${error.message}` },
      { status: 500 }
    );
  }
}
