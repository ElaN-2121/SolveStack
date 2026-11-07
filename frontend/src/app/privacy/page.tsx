export const metadata = { title: "Privacy Policy | Solvestack" };

export default function PrivacyPage() {
  return (
    <main className="wrap">
      <section className="card">
        <p className="eyebrow">&gt; PRIVACY</p>
        <h1 className="title">Privacy Policy</h1>
        <p className="muted small">Last updated: November 7, 2026</p>

        <h2>What we collect</h2>
        <p>
          When you sign in with Google, we receive your name, email address and profile picture.
          We also store the handle you choose and the challenge data you add to the app.
        </p>

        <h2>How we use it</h2>
        <p>
          Only to run Solvestack: to sign you in, show your profile, and save your challenges.
          We don&apos;t sell your data, show ads, or share it with anyone.
        </p>

        <h2>Where it&apos;s stored</h2>
        <p>The app is hosted on Vercel and the database is hosted on Neon.</p>

        <h2>Deleting your data</h2>
        <p>
          To delete your account and data, email <strong>elnathannigussie@gmail.com</strong>.
        </p>
      </section>
    </main>
  );
}