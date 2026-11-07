import SettingsForm from "@/components/SettingsForm";
import PushSettings from "@/components/PushSettings";

export const metadata = { title: "Settings | Solvestack" };

export default function SettingsPage() {
  return (
    <main className="wrap">
      <div>
        <p className="eyebrow">&gt; CONTROL PANEL</p>
        <h1 className="title">Settings</h1>
      </div>
      <SettingsForm />
      <PushSettings />
    </main>
  );
}
