import { signOut } from "@/auth";
import MenuDropdown from "@/components/MenuDropdown";

type Props = {
  user: { handle: string | null; email: string | null; image: string | null };
};

export default function UserMenu({ user }: Props) {
  return (
    <MenuDropdown
      summary={
        <>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" width={28} height={28} referrerPolicy="no-referrer" />
          ) : (
            <span className="avatar-fallback">{(user.handle ?? "?").charAt(0).toUpperCase()}</span>
          )}
          <span>@{user.handle}</span>
        </>
      }
    >
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
    </MenuDropdown>
  );
}