import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import connectDB, { client } from "@/database/db";
import bcrypt from "bcryptjs";
import { username } from "better-auth/plugins";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

if (process.env.MONGO_URI) {
  void connectDB();
}

const db = client.db();

// must change BETTER_AUTH_URL before production deployment to match the actual URL of the deployed app, and ensure it's included in trustedOrigins and baseURL

/* 
- Better Auth stores session data in a cookie 
- creates user, account, and sessions tables to store data
- session is automaticcly created, but not needed
- checks if a username is taken
*/

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: baseURL,
  basePath: "/api/auth",
  trustedOrigins: [baseURL],
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
