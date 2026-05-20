import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import connectDB from "@/database/db";
import Admin from "@/database/models/adminSchema";

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

type AuthContext = {
  session: unknown;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId: string | null;
  name: string | null;
  email: string | null;
};

export const getAuthContext = async (): Promise<AuthContext> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = (session as { user?: { id?: string; name?: string; email?: string } } | null)?.user;
  const userId = user?.id ?? null;
  const name = user?.name ?? null;
  const email = user?.email ?? null;

  let isAdmin = false;
  if (email && adminEmails.has(email.toLowerCase())) {
    isAdmin = true;
  } else if (userId) {
    await connectDB();
    isAdmin = Boolean(await Admin.exists({ adminId: userId }));
  }

  return {
    session,
    isAuthenticated: session !== null,
    isAdmin,
    userId,
    name,
    email,
  };
};
