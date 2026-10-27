import { redirect } from "next/navigation";

// "/" just sends people to the dashboard; the (app) layout bounces them to /login if needed.
export default function Home() {
  redirect("/dashboard");
}
