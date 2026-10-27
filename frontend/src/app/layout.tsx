import type { Metadata } from "next";
import "./hud.css";

export const metadata: Metadata = {
  title: "Solvestack",
  description: "Track every solve. Level up every day.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="hud-bg" aria-hidden="true">
          <span className="node n1" />
          <span className="node n2" />
          <span className="node n3" />
          <span className="node n4" />
        </div>
        {children}
      </body>
    </html>
  );
}
