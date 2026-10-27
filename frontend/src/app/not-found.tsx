import Link from "next/link";

export default function NotFound() {
  return (
    <main className="center">
      <section className="panel">
        <p className="eyebrow">ERROR 404</p>
        <h1 className="title">SIGNAL LOST</h1>
        <p className="muted">That page doesn&apos;t exist in this sector.</p>
        <Link href="/dashboard" className="btn">
          Back to base
        </Link>
      </section>
    </main>
  );
}
