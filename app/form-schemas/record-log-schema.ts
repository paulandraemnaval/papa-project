import * as z from "zod";

const recordLogFormSchema = z.object({
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
  tracking_number: z
    .string()
    .min(11, "Tracking Number must be at least 11 characters"),
  payee: z.string().min(1, "Payee is required"),
  nature_of_transaction: z.string().min(1, "Nature of Transaction is required"),
  allotment_class: z.string().min(1, "Allotment Class is required"),
  legal_basis: z.string().min(1, "Legal Basis is required"),
  amount: z.coerce
    .number<number>("Amount is required")
    .min(0.01, "Amount must be a positive number"),
});

export { recordLogFormSchema };
