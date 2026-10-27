import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { getCurrentUser } from "@/lib/session";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "ACCESS DENIED: this account isn't allowed to sign in.",
  OAuthAccountNotLinked: "ACCOUNT MISMATCH: this email is linked to a different sign-in method.",
  Configuration: "SYSTEM ERROR: auth is misconfigured. Check the environment variables.",
  Default: "SIGN-IN FAILED: something went wrong. Try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Already signed in (and the user row exists)? Skip the login screen.
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;
  const message = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default) : null;

  return (
    <main className="center">
      <section className="panel">
        <p className="eyebrow">SOLVESTACK // v0.1</p>
        <h1 className="title">Track every solve.</h1>
        <p className="muted">Level up every day.</p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit" className="btn">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#04120a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
            </svg>
            Continue with Google
          </button>
        </form>

        {message && (
          <p className="terminal-error" role="alert">
            &gt; {message}
          </p>
        )}

        <p className="status">
          <span className="dot" /> SYSTEM ONLINE
        </p>
      </section>
    </main>
  );
}
