import { getAuthContext } from "@/lib/authz";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const { isAdmin } = await getAuthContext();

  return <LoginForm isAdmin={isAdmin} />;
}
