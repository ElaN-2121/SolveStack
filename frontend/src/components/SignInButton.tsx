import { signIn } from "@/auth";

type Props = {
  label?: string;
  redirectTo?: string;
};

// One sign-in button shared by the landing page and /login.
export default function SignInButton({ label = "Continue with Google", redirectTo = "/dashboard" }: Props) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo });
      }}
    >
      <button type="submit" className="btn">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#04120a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
        </svg>
        {label}
      </button>
    </form>
  );
}
