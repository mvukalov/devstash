/**
 * Module augmentation for NextAuth.
 *
 * The default `Session["user"]` carries name/email/image but no id, and every
 * query in src/lib/db is scoped by user id — so the id is put on the session in
 * the `session` callback in src/auth.ts and declared here.
 */
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
