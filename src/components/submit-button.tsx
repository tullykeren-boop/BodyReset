"use client";

import { useFormStatus } from "react-dom";
import { ButtonHTMLAttributes } from "react";
import { primaryButtonClasses } from "@/components/buttons";

export function SubmitButton({
  children,
  className,
  pendingText,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      className={primaryButtonClasses(className)}
      {...props}
    >
      {pending ? pendingText ?? "Please wait…" : children}
    </button>
  );
}
