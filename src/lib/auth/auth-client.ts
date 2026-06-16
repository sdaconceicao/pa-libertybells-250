import { createAuthClient } from "better-auth/react";

/**
 * Client-side Better Auth instance. Talks to the auth API route mounted at
 * /api/auth. baseURL defaults to the current origin in the browser, which is
 * what we want for both local dev and Vercel.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
