import { redirect } from "next/navigation";
import SignInButton from "@/components/SignInButton";
import { getCurrentUser } from "@/lib/session";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "ACCESS DENIED: this account isn't allowed to sign in.",
  OAuthAccountNotLinked: "ACCOUNT MISMATCH: this email is linked to a different sign-in method.",
  Configuration: "SYSTEM ERROR: auth setup failed. Check the terminal / server logs.",
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

        <SignInButton />

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
