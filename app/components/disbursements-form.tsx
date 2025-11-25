import { useForm } from "@tanstack/react-form";
import { disbursementsFormSchema } from "../form-schemas/disbursements-schema";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Combobox } from "./combo-box";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type orsNumberData = {
  payee: string;
  nature_of_transaction: string;
  amount_obligated: number;
};

async function getORSNumbers(): Promise<string[] | null> {
  try {
    const request = await fetch("api/obligations/get-ors-numbers");
    const response = await request.json();
    return response.ors_numbers;
  } catch (errror: any) {
    toast.error("An error has occured, Please refresh and try again");
    return null;
  }
}

async function getORSNumberData(
  ORSNumber: string
): Promise<orsNumberData | null> {
  try {
    const request = await fetch("/api/obligations/get-row-from-ors-number", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ORSNumber }),
    });
    const response = await request.json();
    return response.data;
  } catch (error: any) {
    toast.error("An error has occured. Please refresh and try again");
    return null;
  }
}

export default function DisbursementForm() {
  const [loading, setLoading] = useState(false);
  const { data: orsNumbers, isLoading } = useQuery({
    queryKey: ["ors_tracking_numbers"],
    queryFn: getORSNumbers,
    refetchOnWindowFocus: false,
  });

  const form = useForm({
    defaultValues: {
      ors_no: "-- Select ORS Number --",
      payee: "",
      nature_of_transaction: "",
      amount_obligated: undefined as unknown as number,
      check_or_ada_no: "",
      day: "",
      month: "",
      year: "",
      tax: undefined as unknown as number,
      amount_disbursed: undefined as unknown as number,
    },
    validators: {
      onSubmit: disbursementsFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        const request = await fetch("api/disbursements", {
          method: "POST",
          body: JSON.stringify(value),
        });
        const response = await request.json();
        if (request.ok) {
          toast.success("Disbursement added successfully");
          form.reset();
        } else {
          toast.error("Failed to add disbursement");
        }
      } catch {
        toast.error("An error occured. Please try again later");
      } finally {
        setLoading(false);
      }
    },
  });

  async function handleSelectORSNumber(ORSNumber: string) {
    const orsNumberData = await getORSNumberData(ORSNumber);

    if (orsNumberData === null) {
      return null;
    }

    const { nature_of_transaction, amount_obligated, payee } = orsNumberData;

    form.setFieldValue("nature_of_transaction", nature_of_transaction);
    form.setFieldValue("amount_obligated", amount_obligated);
    form.setFieldValue("payee", payee);
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disbursements</CardTitle>
        <CardDescription>
          Fill out the form below to record a new disbursement
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="ors_no"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>ORS Number</FieldLabel>
                    <Combobox
                      options={orsNumbers || []}
                      itemName="ORS Number"
                      value={
                        Array.isArray(orsNumbers) && orsNumbers.length > 0
                          ? field.state.value
                          : "No Ors Numbers found"
                      }
                      onValueChange={(value) => {
                        field.setValue(value);
                        handleSelectORSNumber(value);
                      }}
                      isLoading={isLoading}
                      ariaInvalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError>
                        {field.state.meta.errors[0]?.message}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="payee"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Payee</FieldLabel>
                    <Input
                      readOnly={true}
                      id={field.name}
                      className="bg-muted"
                      name={field.name}
                      placeholder="Auto-filled Payee"
                      value={field.state.value ?? ""}
                      onChange={(e) => field.setValue(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError>
                        {field.state.meta.errors[0]?.message}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="nature_of_transaction"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Nature of Transaction</FieldLabel>
                    <Input
                      readOnly={true}
                      id={field.name}
                      className="bg-muted"
                      name={field.name}
                      placeholder="Auto-filled Nature of Transaction"
                      value={field.state.value ?? ""}
                      onChange={(e) => field.setValue(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError>
                        {field.state.meta.errors[0]?.message}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="amount_obligated"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Amount Obligated</FieldLabel>
                    <Input
                      readOnly={true}
                      id={field.name}
                      className="bg-muted"
                      name={field.name}
                      placeholder="Auto-filled Payee"
                      value={field.state.value ?? ""}
                      onChange={(e) =>
                        field.setValue(parseFloat(e.target.value))
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError>
                        {field.state.meta.errors[0]?.message}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="check_or_ada_no"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Check/ADA No.</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="Enter Check or ADA No"
                    value={field.state.value}
                    onChange={(e) => field.setValue(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                  />
                  {isInvalid && (
                    <FieldError>
                      {field.state.meta.errors[0]?.message}
                    </FieldError>
                  )}
                </Field>;
              }}
            />
            <FieldSet>
              <FieldGroup>
                <div className="grid grid-cols-3 gap-4">
                  <form.Field
                    name="month"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel>Month</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="MM"
                            value={field.state.value}
                            onChange={(e) => field.setValue(e.target.value)}
                            onBlur={field.handleBlur}
                            aria-invalid={isInvalid}
                            autoComplete="off"
                            maxLength={2}
                          />
                          {isInvalid && (
                            <FieldError>
                              {field.state.meta.errors[0]?.message}
                            </FieldError>
                          )}
                        </Field>
                      );
                    }}
                  />
                  <form.Field
                    name="day"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel>Day</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="DD"
                            value={field.state.value}
                            onChange={(e) => field.setValue(e.target.value)}
                            onBlur={field.handleBlur}
                            aria-invalid={isInvalid}
                            autoComplete="off"
                            maxLength={2}
                          />
                          {isInvalid && (
                            <FieldError>
                              {field.state.meta.errors[0]?.message}
                            </FieldError>
                          )}
                        </Field>
                      );
                    }}
                  />
                  <form.Field
                    name="year"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel>Year</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="YYYY"
                            value={field.state.value}
                            onChange={(e) => field.setValue(e.target.value)}
                            onBlur={field.handleBlur}
                            aria-invalid={isInvalid}
                            autoComplete="off"
                            maxLength={4}
                          />
                          {isInvalid && (
                            <FieldError>
                              {field.state.meta.errors[0]?.message}
                            </FieldError>
                          )}
                        </Field>
                      );
                    }}
                  />
                </div>
              </FieldGroup>
            </FieldSet>
            <form.Field
              name="tax"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Tax</FieldLabel>
                    <Input
                      inputMode="decimal"
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          field.handleChange(undefined as unknown as number);
                        } else {
                          const regex = /^\d*\.?\d{0,2}$/;
                          if (regex.test(value)) {
                            field.handleChange(value as unknown as number);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (field.state.value) {
                          const parsed = parseFloat(
                            field.state.value as unknown as string
                          );
                          if (!isNaN(parsed)) {
                            field.handleChange(
                              parsed.toFixed(2) as unknown as number
                            );
                          }
                        }
                        field.handleBlur();
                      }}
                      placeholder="0.00"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError>
                        {field.state.meta.errors[0]?.message}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="amount_disbursed"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Amount Disbursed</FieldLabel>
                    <Input
                      inputMode="decimal"
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          field.handleChange(undefined as unknown as number);
                        } else {
                          const regex = /^\d*\.?\d{0,2}$/;
                          if (regex.test(value)) {
                            field.handleChange(value as unknown as number);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (field.state.value) {
                          const parsed = parseFloat(
                            field.state.value as unknown as string
                          );
                          if (!isNaN(parsed)) {
                            field.handleChange(
                              parsed.toFixed(2) as unknown as number
                            );
                          }
                        }
                        field.handleBlur();
                      }}
                      placeholder="0.00"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError>
                        {field.state.meta.errors[0]?.message}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <Button type="submit" className="mt-4" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
            {loading && <Spinner />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
