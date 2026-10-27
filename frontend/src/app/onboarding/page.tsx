import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import OnboardingForm from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.handle) redirect("/dashboard");

  return (
    <main className="center">
      <section className="panel">
        <p className="eyebrow">&gt; NEW OPERATIVE DETECTED</p>
        <h1 className="title">Choose your handle</h1>
        <p className="muted">This is your name on Solvestack. 3-20 characters: a-z, 0-9, underscore.</p>
        <OnboardingForm />
      </section>
    </main>
  );
}
