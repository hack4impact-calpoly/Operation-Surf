import { redirect } from "next/navigation";
import VolunteerApplicationForm from "./VolunteerApplicationForm";
import { getAuthContext } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function VolunteerApplicationPage() {
  const { isAuthenticated } = await getAuthContext();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <VolunteerApplicationForm />;
}
