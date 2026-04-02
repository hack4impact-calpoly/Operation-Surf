import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "@/database/db";
import bcrypt from "bcrypt";
import { username } from "better-auth/plugins";

const baseURL: string = process.env.BETTER_AUTH_URL as string;
const db = client.db();

// must change BETTER_AUTH_URL before production deployment to match the actual URL of the deployed app, and ensure it's included in trustedOrigins

/* 
Better Auth stores session data in a cookie by default, but it can be configured to use JWTs for stateless sessions. In this configuration, we enable cookie caching with a JWT strategy, which allows for stateless refresh tokens while still benefiting from the performance of cached sessions. The refreshCache option ensures that the cache is refreshed when the session is refreshed, maintaining up-to-date session data without requiring server-side storage.
*/

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: process.env.BETTER_AUTH_SECRET,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 24 * 60 * 60, // 1 days cache duration
      strategy: "jwt",
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true, // Store account data in a cookie
  },

  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => bcrypt.hash(password, 10),
      verify: async ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  plugins: [username()],
});
