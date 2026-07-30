import { BreathRing } from "@/components/breath-ring";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <BreathRing size={64} className="mx-auto" />
        <h1 className="font-display mt-6 text-2xl tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-soft">Sign in to continue your recovery plan.</p>
      </div>
      <LoginForm />
    </div>
  );
}
