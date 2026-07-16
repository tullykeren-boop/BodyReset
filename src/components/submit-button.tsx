"use client";

import { useFormStatus } from "react-dom";
import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

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
      className={clsx(
        "inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {pending ? pendingText ?? "Please wait…" : children}
    </button>
  );
}
