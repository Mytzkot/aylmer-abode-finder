// Shared client-side validation schemas. Kept loose enough for real-world
// data but strict enough to block junk and abuse.
import { z } from "zod";

const phoneRegex = /^[+0-9 ()\-.]{7,20}$/;

export const applySchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(60),
  surname: z.string().trim().min(1, "Last name is required").max(60),
  telephone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number")
    .max(20),
  email: z.string().trim().email("Enter a valid email").max(120),
  present_address: z.string().trim().max(200).optional().or(z.literal("")),
  reason_for_moving: z.string().trim().max(500).optional().or(z.literal("")),
  current_landlord_name: z.string().trim().max(120).optional().or(z.literal("")),
  current_landlord_phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
  date_of_birth: z.string().trim().max(20).optional().or(z.literal("")),
  monthly_income: z
    .number({ invalid_type_error: "Income must be a number" })
    .min(0)
    .max(1_000_000)
    .nullable()
    .optional(),
  employer_name: z.string().trim().max(120).optional().or(z.literal("")),
  employer_phone: z.string().trim().max(20).optional().or(z.literal("")),
  school_name: z.string().trim().max(120).optional().or(z.literal("")),
  additional_information: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("")),
});

export const bookSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name").max(80),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Enter a valid phone number")
      .max(20),
    email: z.string().trim().email("Enter a valid email").max(120),
    checkin: z.string().min(1, "Pick a check-in date"),
    checkout: z.string().min(1, "Pick a check-out date"),
  })
  .refine((d) => d.checkout > d.checkin, {
    message: "Check-out must be after check-in",
    path: ["checkout"],
  });

export function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Please check the form and try again.";
}
