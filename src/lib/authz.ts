import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const baseURL: string = process.env.BETTER_AUTH_URL as string;

type AuthContext = {
  session: unknown;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId: string | null;
  name: string | null;
  email: string | null;
};

const parseCsvEnv = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

export const getAuthContext = async (): Promise<AuthContext> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = (session as { user?: { id?: string; name?: string; email?: string } } | null)?.user;
  const userId = user?.id ?? null;
  const name = user?.name ?? null;
  const email = user?.email ?? null;

  const admin = await fetch(`${baseURL}/api/admin/${userId}`);
  console.log("Admin API response:", admin.ok);

  return {
    session,
    isAuthenticated: session !== null,
    isAdmin: admin.ok ? true : false,
    userId,
    name,
    email,
  };
};
