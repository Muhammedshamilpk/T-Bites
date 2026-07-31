import { z } from "zod";

// ── Auth Schemas ────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(7, "Please enter a valid phone number (at least 7 digits)")
    .max(15, "Phone number is too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "restaurant_owner"], {
    error: "Please select a role",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
