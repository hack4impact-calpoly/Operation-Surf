import { headers } from "next/headers";
import { auth } from "@/lib/auth";

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

const ADMIN_USER_IDS = new Set(parseCsvEnv(process.env.ADMIN_USER_IDS));
const ADMIN_EMAILS = new Set(parseCsvEnv(process.env.ADMIN_EMAILS));

export const getAuthContext = async (): Promise<AuthContext> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = (session as { user?: { id?: string; name?: string; email?: string } } | null)?.user;
  const userId = user?.id ?? null;
  const name = user?.name ?? null;
  const email = user?.email ?? null;

  const isAdmin = (userId !== null && ADMIN_USER_IDS.has(userId)) || (email !== null && ADMIN_EMAILS.has(email));

  return {
    session,
    isAuthenticated: session !== null,
    isAdmin,
    userId,
    name,
    email,
  };
};
