import { BreathRing } from "@/components/breath-ring";
import { SignUpForm } from "./signup-form";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <BreathRing size={64} className="mx-auto" />
        <h1 className="font-display mt-6 text-2xl tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Five quick questions and we&apos;ll build your recovery plan. No credit card required.
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
