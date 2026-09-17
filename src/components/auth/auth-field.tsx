import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";

interface AuthFieldProps extends ComponentProps<typeof Input> {
  label: string;
  id: string;
}

/**
 * Label + input pair for the auth forms.
 *
 * A plain <label> rather than the shadcn `label`/`form` components, which are
 * not installed — these two forms are the only consumers, and neither needs
 * react-hook-form.
 */
export function AuthField({ label, id, ...props }: AuthFieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input id={id} {...props} />
    </div>
  );
}
