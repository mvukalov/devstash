/**
 * Zod schemas and shared shapes for the credentials auth flows.
 *
 * Kept out of src/lib/db so both halves of the split NextAuth config can import
 * it — these are pure validation with no Prisma and no `server-only`.
 */
import { z } from "zod";

// Long enough to be worth hashing, short enough that bcrypt's 72-byte input
// limit is never the thing that rejects a password.
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

export const signInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password,
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    email: z.email("Enter a valid email address"),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * The fields NextAuth renders on its sign-in form.
 *
 * Declared once and shared, because the Credentials provider is built twice —
 * as an edge-safe placeholder in src/auth.config.ts and for real in src/auth.ts
 * — and the two must describe the same form.
 */
export const CREDENTIALS_FIELDS = {
  email: { label: "Email", type: "email" },
  password: { label: "Password", type: "password" },
} as const;
