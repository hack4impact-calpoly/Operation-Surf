import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

const baseURL: string = process.env.NEXT_PUBLIC_BETTER_AUTH_URL as string;

export const authClient = createAuthClient({
  baseURL: baseURL,
  plugins: [usernameClient()],
});
