"use client";

import { useCallback, useEffect, useState } from "react";

type Me = {
  id: string;
  handle: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  onboarded: boolean;
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; me: Me };

export default function ProfileCard() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async (signal?: AbortSignal) => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/me", { signal });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("bad response");
      setState({ status: "ready", me: await res.json() });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setState({ status: "error", message: "Couldn't load your profile." });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (state.status === "loading") {
    return (
      <section className="card" aria-busy="true">
        <p className="muted">&gt; loading profile...</p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="card">
        <p className="terminal-error" role="alert">
          &gt; {state.message}
        </p>
        <button className="btn btn-ghost" onClick={() => load()}>
          Retry
        </button>
      </section>
    );
  }

  const { me } = state;
  return (
    <section className="card">
      <p className="eyebrow">&gt; WELCOME BACK</p>
      <h1 className="title">@{me.handle}</h1>
      <p className="muted">
        <span className="badge">Script Kiddie</span> XP 0 / 100
      </p>
      <div className="xp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
        <div className="xp-fill" style={{ width: "0%" }} />
      </div>
    </section>
  );
}
