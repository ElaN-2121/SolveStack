import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import UserMenu from "@/components/UserMenu";

// Everything inside the (app) route group is protected here.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.handle) redirect("/onboarding");

  return (
    <>
      <header className="header">
        <Link href="/dashboard" className="logo">
          SOLVESTACK
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/challenges">Challenges</Link>
        </nav>
        <div className="header-right">
          <span className="chip chip-xp">XP 0</span>
          <span className="chip chip-streak">🔥 0</span>
          <UserMenu user={user} />
        </div>
      </header>
      {children}
    </>
  );
}
