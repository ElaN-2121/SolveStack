import ChallengesClient from "@/components/ChallengesClient";

export const metadata = { title: "Challenges | Solvestack" };

export default function ChallengesPage() {
  return (
    <main className="wrap">
      <div>
        <p className="eyebrow">&gt; MISSION LOG</p>
        <h1 className="title">Challenges</h1>
      </div>
      <ChallengesClient />
    </main>
  );
}
