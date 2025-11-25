import { google, sheets_v4 } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

async function calculateBalanceAndTotalDisbursed(
  ORSNumber: string,
  amount_obligated: number,
  amount_disbursed: number
): Promise<{ balance: number; total_disbursed: number } | null> {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const service = google.sheets({ version: "v4", auth });

    //1. Get ORS number column of disbursements sheet
    const response = await service.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: "'Copy of Disbursements'!A2:A",
    });

    const ORS_numbers_from_sheet = response.data.values;

    // If no rows are found, that means this is the first disbursement. Return balance as Amount Obligated - Amount Disbursed
    // and also return the total disbursed as the Amount Disbursed
    if (!ORS_numbers_from_sheet || ORS_numbers_from_sheet.length === 0) {
      const balance = amount_obligated - amount_disbursed;
      const total_disbursed = amount_disbursed;
      return { balance, total_disbursed };
    }

    //2. Get each row index where ORS Number matches
    let indeces = [];
    for (const [index, value] of ORS_numbers_from_sheet.entries()) {
      if (value[0] === ORSNumber) {
        indeces.push(index + 2);
      }
    }

    //3. Get the Amount Disburesed of each row index
    const ranges = indeces.map((index) => `'Copy of Disbursements'!H${index}`);

    const amount_disbursed_from_sheets =
      await service.spreadsheets.values.batchGet({
        spreadsheetId: process.env.SHEET_ID,
        ranges,
      });

    //4. Calculate the total amount already disbursed in the sheets
    const total_amount_disbursed_from_sheets =
      amount_disbursed_from_sheets.data.valueRanges?.reduce(
        (total: number, valueRangeObj) => {
          const values_from_valueRangeObj = valueRangeObj.values;
          if (
            values_from_valueRangeObj === null ||
            values_from_valueRangeObj === undefined
          )
            return total;

          const raw_values = parseFloat(values_from_valueRangeObj[0][0]);
          return total + raw_values;
        },
        0
      ) ?? 0;

    const total_disbursed: number =
      total_amount_disbursed_from_sheets + amount_disbursed;

    const balance: number =
      amount_obligated -
      (total_amount_disbursed_from_sheets + amount_disbursed);

    return { balance, total_disbursed };
  } catch (error: any) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ors_no,
      payee,
      nature_of_transaction,
      amount_obligated,
      check_or_ada_no,
      day,
      month,
      year,
      tax,
      amount_disbursed,
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

    const response = await calculateBalanceAndTotalDisbursed(
      ors_no,
      Number(amount_obligated),
      Number(amount_disbursed)
    );

    if (response === null) {
      return NextResponse.json(
        {
          message:
            "error occured when calculating balance and total disbursed. Please try again",
        },
        { status: 500 }
      );
    }

    const disbursement_values = [
      [
        ors_no,
        payee,
        nature_of_transaction,
        Number(amount_obligated),
        check_or_ada_no,
        new Date(date).toLocaleDateString("en-PH"),
        Number(tax),
        amount_disbursed,
        response.balance,
      ],
    ];

    //update summary sheet side-effect

    let summary_promise;

    //1. Get all the ORS numbers from summary sheet
    const summary_sheet_ors_nums = await service.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: "'Copy of Summary_Obligation_vs_Disbursement'!A2:A",
    });

    const ors_numbers = summary_sheet_ors_nums.data.values;

    //if there are no ors_numbers in the summary sheet, this is the first one. Insert it right away
    if (ors_numbers === null || ors_numbers === undefined) {
      const summary_values = [
        [
          ors_no,
          payee,
          amount_obligated,
          response.total_disbursed,
          response.balance,
        ],
      ];

      const summary_requestBody = {
        values: summary_values,
      };

      summary_promise = service.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: "'Copy of Summary_Obligation_vs_Disbursement'!A:E",
        valueInputOption: "USER_ENTERED",
        requestBody: summary_requestBody,
      });
    } else {
      //2. Find the row index to be updated
      const rowIdx = ors_numbers?.findIndex((row) => row[0] === ors_no);

      //3. if the row deesnt exist in the summary sheet, append it to the end
      if (rowIdx === -1 || rowIdx === undefined) {
        const summary_values = [
          [
            ors_no,
            payee,
            amount_obligated,
            response.total_disbursed,
            response.balance,
          ],
        ];

        const summary_requestBody = {
          values: summary_values,
        };

        summary_promise = service.spreadsheets.values.append({
          spreadsheetId: process.env.SHEET_ID,
          range: `'Copy of Summary_Obligation_vs_Disbursement'!A:E`,
          valueInputOption: "USER_ENTERED",
          requestBody: summary_requestBody,
        });
      } else {
        const acutal_rowIdx = rowIdx + 2;
        //4. update the row using the row index
        const summary_values = {
          data: [
            {
              range: `'Copy of Summary_Obligation_vs_Disbursement'!D${acutal_rowIdx}`,
              values: [[response.total_disbursed]],
            },
            {
              range: `'Copy of Summary_Obligation_vs_Disbursement'!E${acutal_rowIdx}`,
              values: [[response.balance]],
            },
          ],
          valueInputOption: "USER_ENTERED",
        };

        summary_promise = service.spreadsheets.values.batchUpdate({
          spreadsheetId: process.env.SHEET_ID,
          requestBody: summary_values,
        });
      }
    }

    const disbursement_requestBody = {
      values: disbursement_values,
    };

    const promises = [
      service.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: "'Copy of Disbursements'!A:I",
        valueInputOption: "USER_ENTERED",
        requestBody: disbursement_requestBody,
      }),
      summary_promise,
    ];

    const result = await Promise.all(promises);

    return NextResponse.json(
      {
        message: "Disbursement log added successfully",
        result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `an error occured while submitting the disbursement: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
