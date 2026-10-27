import { signOut } from "@/auth";

type Props = {
  user: { handle: string | null; email: string | null; image: string | null };
};

// A native <details> element gives us a dropdown with no client-side JavaScript.
export default function UserMenu({ user }: Props) {
  return (
    <details className="user-menu">
      <summary>
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" width={28} height={28} referrerPolicy="no-referrer" />
        ) : (
          <span className="avatar-fallback">{(user.handle ?? "?").charAt(0).toUpperCase()}</span>
        )}
        <span>@{user.handle}</span>
      </summary>
      <div className="menu-panel">
        {user.email && <p className="muted small">{user.email}</p>}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="btn btn-ghost">
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
