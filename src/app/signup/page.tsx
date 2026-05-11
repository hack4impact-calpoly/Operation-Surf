import { getAuthContext } from "@/lib/authz";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const { isAdmin } = await getAuthContext();

  return <SignupForm isAdmin={isAdmin} />;
}
