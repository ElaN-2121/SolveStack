import Link from "next/link";
import SignInButton from "@/components/SignInButton";
import { getCurrentUser } from "@/lib/session";
import { FEATURES, getCta } from "@/lib/landing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Solvestack | Track every CTF solve",
  description:
    "Solvestack is a CTF practice tracker: log challenges, journal what you learn and level up every day.",
};

export default async function Home() {
  // The landing page must still render if auth or the database is down.
  const user = await getCurrentUser().catch(() => null);
  const cta = getCta(Boolean(user));

  return (
    <>
      <header className="header">
        <span className="logo">SOLVESTACK</span>
        <nav className="nav" aria-label="Main">
          <a href="#features">Features</a>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </header>

      <main className="wrap">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">&gt; CTF PRACTICE TRACKER</p>
            <h1 className="hero-title">
              Track every solve.
              <br />
              <span className="accent">Level up every day.</span>
            </h1>
            <p className="muted hero-sub">
              Solvestack is a practice tracker for CTF players. Log the challenges you work on,
              journal what you learn, and watch your skills grow.
            </p>

            <div className="hero-cta">
              {cta.kind === "dashboard" ? (
                <Link href={cta.href} className="btn">
                  {cta.label}
                </Link>
              ) : (
                <SignInButton label={cta.label} />
              )}
            </div>
            <p className="muted small">Sign in with Google to start. No card needed.</p>
          </div>

          <div className="terminal" aria-hidden="true">
            <p className="terminal-bar">solvestack ~ mission log</p>
            <p><span className="accent">$</span> log --challenge &quot;Cookies&quot; --cat web</p>
            <p className="ok">✔ solved <span className="amber">+100 XP</span></p>
            <p><span className="accent">$</span> log --challenge &quot;Base64 Basics&quot; --cat crypto</p>
            <p className="ok">✔ solved <span className="amber">+50 XP</span></p>
            <p><span className="accent">$</span> streak</p>
            <p>🔥 3 days. Keep going.</p>
          </div>
        </section>

        <section id="features" className="features-section">
          <p className="eyebrow">&gt; FEATURES</p>
          <h2 className="section-title">Everything you need to keep solving</h2>
          <ul className="features">
            {FEATURES.map((f) => (
              <li key={f.title} className="feature">
                <div className="row-between">
                  <span className="feature-icon" aria-hidden="true">{f.icon}</span>
                  <span className={f.status === "live" ? "badge-live" : "badge-soon"}>
                    {f.status === "live" ? "Live" : "Coming soon"}
                  </span>
                </div>
                <h3>{f.title}</h3>
                <p className="muted small">{f.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">
        <span className="muted small">&copy; {new Date().getFullYear()} Solvestack</span>
        <Link href="/privacy" className="small">
          Privacy Policy
        </Link>
      </footer>
    </>
  );
}
