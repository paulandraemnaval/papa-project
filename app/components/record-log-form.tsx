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
import { toast } from "sonner";
import { recordLogFormSchema } from "../form-schemas/record-log-schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function RecordLogForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    defaultValues: {
      month: "",
      day: "",
      year: "",
      tracking_number: "",
      payee: "",
      nature_of_transaction: "",
      allotment_class: "",
      legal_basis: "",
      amount: undefined as unknown as number,
    },
    validators: {
      onSubmit: recordLogFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        const request = await fetch("/api/record-log", {
          method: "POST",
          body: JSON.stringify(value),
        });
        const response = await request.json();
        if (request.ok) {
          toast.success("Record log added successfully");
          form.reset();
        } else {
          toast.error("Failed to add record log: ", response.message);
        }
      } catch (error: any) {
        toast.error(`An error occurred. Please try again`);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Log</CardTitle>
        <CardDescription>
          Fill out the form below to record a new log entry.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
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
              name="tracking_number"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Tracking Number</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter Tracking Number"
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
              name="payee"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Payee</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter Payee"
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
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter Nature of Transaction"
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
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter Allotment Class"
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
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter Legal Basis"
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
                      id={field.name}
                      name={field.name}
                      inputMode="decimal"
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
                      aria-invalid={isInvalid}
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
            {loading ? "Submitting..." : "Submit"} {loading && <Spinner />}
          </Button>
        </form>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
