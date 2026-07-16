"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthFormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

export function SignUpForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(signUp, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <p className="text-xs text-neutral-500">At least 8 characters.</p>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="Creating account…" className="mt-2 w-full">
        Create account
      </SubmitButton>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal-700 hover:underline dark:text-teal-400">
          Sign in
        </Link>
      </p>
    </form>
  );
}
