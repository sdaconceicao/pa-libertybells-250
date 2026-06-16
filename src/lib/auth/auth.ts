import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db, schema } from "../db";

/**
 * Server-side Better Auth instance.
 *
 * This module is server-only — it is imported by the auth API route
 * (src/routes/api/auth/$.ts) and must never be imported from client code.
 * Use the auth client (src/lib/auth/auth-client.ts) in components instead.
 */
export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
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
