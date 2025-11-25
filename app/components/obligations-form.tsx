"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { obligationFormSchema } from "../form-schemas/obligations-schema";
import { Combobox } from "./combo-box";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

type trackingNumberData = {
  payee: string;
  nature_of_transaction: string;
  allotment_class: string;
  legal_basis: string;
  amount: number;
};

async function getOblicationTrackingNumbers(): Promise<string[] | null> {
  try {
    const request = await fetch("/api/record-log/get-tracking-numbers");
    const response = await request.json();
    return response.tracking_numbers;
  } catch (error: any) {
    toast.error("An error has occured. Please refresh and try again");
    return null;
  }
}

async function getTrackingNumberData(
  tracking_number: string
): Promise<trackingNumberData | null> {
  try {
    const request = await fetch(
      "/api/record-log/get-row-from-tracking-number",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tracking_number }),
      }
    );
    const response = await request.json();
    return response.data;
  } catch (error: any) {
    toast.error("An error has occured. Please refresh and try again");
    return null;
  }
}

export default function ObligationsForm() {
  const [loading, setLoading] = useState(false);
  const { data: trackingNumbers, isLoading } = useQuery({
    queryKey: ["obligation_tracking_numbers"],
    queryFn: getOblicationTrackingNumbers,
    refetchOnWindowFocus: false,
  });
  const form = useForm({
    defaultValues: {
      tracking_number: "-- Select Tracking Number --",
      ors_no: "",
      day: "",
      month: "",
      year: "",
      payee: "",
      nature_of_transaction: "",
      allotment_class: "",
      legal_basis: "",
      amount: undefined as unknown as number,
      amount_obligated: undefined as unknown as number,
    },
    validators: {
      onSubmit: obligationFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        const request = await fetch("api/obligations", {
          method: "POST",
          body: JSON.stringify(value),
        });
        const response = await request.json();
        if (request.ok) {
          toast.success("Obligation added successfully");
          form.reset();
        } else {
          toast.error("Failed to add obligation");
        }
      } catch (error) {
        toast.error(`An error occured. Please try again later`);
      } finally {
        setLoading(false);
      }
    },
  });

  async function handleSelectTrackingNumber(trackingNumber: string) {
    const trackingNumberData = await getTrackingNumberData(trackingNumber);

    if (trackingNumberData === null) {
      return null;
    }

    form.setFieldValue("payee", trackingNumberData.payee);
    form.setFieldValue(
      "nature_of_transaction",
      trackingNumberData.nature_of_transaction
    );
    form.setFieldValue("allotment_class", trackingNumberData.allotment_class);
    form.setFieldValue("legal_basis", trackingNumberData.legal_basis);
    form.setFieldValue("amount", trackingNumberData.amount);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Obligations</CardTitle>
        <CardDescription>
          Fill out the form below to record a new obligation.
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
              name="tracking_number"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Tracking Number</FieldLabel>
                    <Combobox
                      options={trackingNumbers || []}
                      itemName="Tracking Number"
                      value={
                        Array.isArray(trackingNumbers) &&
                        trackingNumbers.length > 0
                          ? field.state.value
                          : "No Tracking Numbers Found"
                      }
                      onValueChange={(value) => {
                        field.setValue(value);
                        handleSelectTrackingNumber(value);
                      }}
                      ariaInvalid={isInvalid}
                      isLoading={isLoading}
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
              name="ors_no"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>ORS No.</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Enter ORS No."
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
                  </Field>
                );
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
                      className="bg-muted"
                      id={field.name}
                      name={field.name}
                      placeholder="Auto-filled Nature of Transaction"
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
                  </Field>
                );
              }}
            />
            <form.Field
              name="allotment_class"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Allotment Class</FieldLabel>
                    <Input
                      readOnly={true}
                      className="bg-muted"
                      id={field.name}
                      name={field.name}
                      placeholder="Auto-filled Allotment Class"
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
                  </Field>
                );
              }}
            />
            <form.Field
              name="legal_basis"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Legal Basis</FieldLabel>
                    <Input
                      readOnly={true}
                      className="bg-muted"
                      id={field.name}
                      name={field.name}
                      placeholder="Auto-filled Legal Basis"
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
                  </Field>
                );
              }}
            />
            <form.Field
              name="amount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Amount</FieldLabel>
                    <Input
                      readOnly={true}
                      className="bg-muted"
                      type="number"
                      id={field.name}
                      name={field.name}
                      placeholder="Auto-filled Amount"
                      value={field.state.value || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          field.setValue(undefined as unknown as number);
                        } else {
                          field.setValue(parseFloat(val));
                        }
                      }}
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
