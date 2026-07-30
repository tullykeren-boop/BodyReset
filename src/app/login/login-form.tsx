"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthFormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

const inputClasses =
  "rounded-xl border border-mist bg-card px-4 py-2.5 text-sm outline-none focus:border-moss focus:ring-1 focus:ring-moss";

export function LoginForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(signIn, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClasses} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClasses}
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-[#F3E2D6] px-3 py-2 text-sm text-[#8C4C2C]">{state.error}</p>
      )}

      <SubmitButton pendingText="Signing in…" className="mt-2 w-full">
        Sign in
      </SubmitButton>

      <p className="text-center text-sm text-ink-soft">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-moss-deep hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
