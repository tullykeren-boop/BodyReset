import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";

export async function NavHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Body <span className="text-teal-600">Reset</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/target-area" className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">
                New routine
              </Link>
              <Link href="/dashboard" className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">
                Dashboard
              </Link>
              <Link href="/billing" className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">
                Billing
              </Link>
              <form action={signOut}>
                <button className="rounded-full border border-neutral-300 px-4 py-1.5 font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-full bg-teal-600 px-4 py-1.5 font-medium text-white hover:bg-teal-700">
                Start free trial
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
