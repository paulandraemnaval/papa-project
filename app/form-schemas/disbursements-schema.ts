import * as z from "zod";

const disbursementsFormSchema = z.object({
  ors_no: z.string().regex(/^\d{8}$/, "Please select an ORS number"),
  payee: z.string().min(1, "Payee is required"),
  nature_of_transaction: z.string().min(1, "Nature of Transaction is required"),
  amount_obligated: z.coerce
    .number<number>()
    .min(0, "Amount Obligated must be a positive number"),
  check_or_ada_no: z.string(),
  day: z.coerce
    .number<string>("Day is required")
    .min(1, "Invalid day")
    .max(31, "Invalid day"),
  month: z.coerce
    .number<string>("Month is required")
    .min(1, "Invalid day")
    .max(12, "Invalid day"),
  year: z.coerce
    .number<string>("Year is required")
    .min(1900, "Invalid year")
    .max(2100, "Invalid year"),
  tax: z.coerce.number<number>().min(0, "Tax must be a positive number"),
  amount_disbursed: z.coerce
    .number<number>("Amount Disbursed is required")
    .min(0, "Amount Disbursed must be a positive number"),
});

export { disbursementsFormSchema };
