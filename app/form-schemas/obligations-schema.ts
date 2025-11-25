import * as z from "zod";

const obligationFormSchema = z.object({
  tracking_number: z
    .string()
    .regex(/^TRK\d{8}$/, "Please select a tracking number"),
  ors_no: z.string().min(8, "ORS Number must be at least 8 characters"),
  month: z.coerce
    .number<string>("Month is required")
    .min(1, "Invalid month")
    .max(12, "Invalid month"),
  day: z.coerce
    .number<string>("Day is required")
    .min(1, "Invalid day")
    .max(31, "Invalid day"),
  year: z.coerce
    .number<string>("Year is required")
    .min(1900, "Invalid year")
    .max(2100, "Invalid year"),
  payee: z.string().min(1, "Payee is required"),
  nature_of_transaction: z.string().min(1, "Nature of Transaction is required"),
  allotment_class: z.string().min(1, "Allotment Class is required"),
  legal_basis: z.string().min(1, "Legal Basis is required"),
  amount: z.coerce
    .number<number>()
    .min(0.01, "Amount must be a positive number"),
  amount_obligated: z.coerce
    .number<number>()
    .min(0.01, "Amount Obligated must be a positive number"),
});

export { obligationFormSchema };
