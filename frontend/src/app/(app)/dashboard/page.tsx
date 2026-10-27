import ProfileCard from "@/components/ProfileCard";

export default function DashboardPage() {
  return (
    <main className="wrap">
      <ProfileCard />
      <section className="grid-2">
        <div className="card">
          <h2>Daily mission</h2>
          <p className="muted">Coming soon: a fresh challenge goal every day.</p>
        </div>
        <div className="card">
          <h2>Recent solves</h2>
          <div className="empty">
            <p>No solves logged yet.</p>
            <p className="muted small">Your first one will show up here. Go hack something!</p>
          </div>
        </div>
      </section>
    </main>
  );
}
