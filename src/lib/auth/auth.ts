import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db, schema } from "../db";

/**
 * Resolve the public origin Better Auth uses to build OAuth redirect URIs.
 *
 * OAuth providers must have the exact `redirect_uri` (origin + callback path)
 * registered, so the origin has to match the deployment that's actually
 * serving the request. A single static BETTER_AUTH_URL can't do that across
 * Vercel preview deployments, so we fall back to Vercel's system env vars:
 *   - production → the stable production domain
 *   - preview    → the git-branch alias, which is stable per branch
 *                  (VERCEL_URL changes every deploy, so we avoid it)
 */
function resolveBaseURL(): string | undefined {
	if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;

	if (
		process.env.VERCEL_ENV === "production" &&
		process.env.VERCEL_PROJECT_PRODUCTION_URL
	) {
		return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}

	if (process.env.VERCEL_BRANCH_URL) {
		return `https://${process.env.VERCEL_BRANCH_URL}`;
	}

	// Local dev / unknown: let Better Auth infer from the request host.
	return undefined;
}

/**
 * Server-side Better Auth instance.
 *
 * This module is server-only — it is imported by the auth API route
 * (src/routes/api/auth/$.ts) and must never be imported from client code.
 * Use the auth client (src/lib/auth/auth-client.ts) in components instead.
 */
export const auth = betterAuth({
	baseURL: resolveBaseURL(),
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	account: {
		accountLinking: {
			// When a social sign-in matches the email of an existing user, link
			// it to that account instead of failing with `account_not_linked`.
			// Only providers that verify email ownership should be trusted here.
			enabled: true,
			trustedProviders: ["google", "facebook"],
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
		facebook: {
			clientId: process.env.FACEBOOK_CLIENT_ID as string,
			clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
		},
	},
	plugins: [tanstackStartCookies()],
});
