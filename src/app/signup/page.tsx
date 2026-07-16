import { SignUpForm } from "./signup-form";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Start your 3-day free trial. No commitment, cancel anytime.
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
