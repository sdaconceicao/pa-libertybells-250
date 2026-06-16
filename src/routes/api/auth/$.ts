import { createFileRoute } from "@tanstack/react-router";
import { auth } from "../../../lib/auth/auth";

/**
 * Catch-all handler for Better Auth. Every request under /api/auth/* (sign-in,
 * sign-up, OAuth callbacks, session, sign-out) is forwarded to auth.handler.
 */
export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }: { request: Request }) => auth.handler(request),
			POST: ({ request }: { request: Request }) => auth.handler(request),
		},
	},
});
