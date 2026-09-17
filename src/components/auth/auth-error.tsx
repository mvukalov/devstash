import { AlertCircle } from "lucide-react";

/** Inline form error. Renders nothing when there is no message. */
export function AuthError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="border-destructive/50 bg-destructive/10 text-destructive flex items-start gap-2 rounded-md border px-3 py-2 text-sm"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}
