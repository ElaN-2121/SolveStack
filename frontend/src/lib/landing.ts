// Pure data and helpers for the landing page (no JSX, easy to unit test).

export type FeatureStatus = "live" | "soon";

export type Feature = {
  icon: string;
  title: string;
  description: string;
  status: FeatureStatus;
};

export const FEATURES: Feature[] = [
  {
    icon: "🎯",
    title: "Challenge log",
    description: "Log every challenge with platform, category, difficulty, points and notes. Filter and search in a click.",
    status: "live",
  },
  {
    icon: "📓",
    title: "Solve journal",
    description: "Write up what you tried, what worked and what you learned, while it's still fresh.",
    status: "soon",
  },
  {
    icon: "📊",
    title: "Progress analytics",
    description: "See your solves by category and difficulty, and spot the areas that need more practice.",
    status: "soon",
  },
  {
    icon: "🔐",
    title: "Flag vault",
    description: "Keep your captured flags in an encrypted vault instead of scattered text files.",
    status: "soon",
  },
  {
    icon: "🔥",
    title: "XP, ranks and streaks",
    description: "Earn XP for every solve, climb the ranks and keep your daily streak alive.",
    status: "soon",
  },
  {
    icon: "🏁",
    title: "CTFtime events",
    description: "Find upcoming CTFs and track how you did in each one.",
    status: "soon",
  },
];

export type Cta =
  | { kind: "dashboard"; label: string; href: string }
  | { kind: "signin"; label: string };

/** Signed-in visitors get a dashboard link; everyone else gets the Google sign-in button. */
export function getCta(signedIn: boolean): Cta {
  return signedIn
    ? { kind: "dashboard", label: "Open dashboard", href: "/dashboard" }
    : { kind: "signin", label: "Continue with Google" };
}
