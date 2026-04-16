import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "@/database/db";
import bcrypt from "bcrypt";
import { username } from "better-auth/plugins";

const baseURL: string = process.env.BETTER_AUTH_URL as string;
const db = client.db();

// must change BETTER_AUTH_URL before production deployment to match the actual URL of the deployed app, and ensure it's included in trustedOrigins and baseURL

/* 
- Better Auth stores session data in a cookie 
- creates user, account, and sessions tables to store data
- session is automaticcly created, but not needed
- checks if a username is taken

document examples:

user:
{
  "_id": {
    "$oid": "69ce0a405639119221475a54"
  },
  "name": "John Doe",
  "email": "johndoe1@example.com",
  "emailVerified": false,
  "createdAt": {
    "$date": "2026-04-02T06:18:40.904Z"
  },
  "updatedAt": {
    "$date": "2026-04-02T06:18:40.904Z"
  },
  "username": "johndoe",
  "displayUsername": "johndoe"
}

account:
{
  "_id": {
    "$oid": "69ce0a415639119221475a55"
  },
  "accountId": "69ce0a405639119221475a54",
  "providerId": "credential",
  "userId": {
    "$oid": "69ce0a405639119221475a54"
  },
  "password": "$2b$10$hTYSq1YG9fHjJup8LBskV.D7.c00SqZv4z/WaM3Z9/6zPUgLk.BYi",
  "createdAt": {
    "$date": "2026-04-02T06:18:41.008Z"
  },
  "updatedAt": {
    "$date": "2026-04-02T06:18:41.008Z"
  }
}

session:
{
  "_id": {
    "$oid": "69ce0a415639119221475a56"
  },
  "expiresAt": {
    "$date": "2026-04-09T06:18:41.100Z"
  },
  "token": "i1ud8drBns27DRhI0CVFZUuJN0k9fCCe",
  "createdAt": {
    "$date": "2026-04-02T06:18:41.101Z"
  },
  "updatedAt": {
    "$date": "2026-04-02T06:18:41.101Z"
  },
  "ipAddress": "0000:0000:0000:0000:0000:0000:0000:0000",
  "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
  "userId": {
    "$oid": "69ce0a405639119221475a54"
  }
}
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
