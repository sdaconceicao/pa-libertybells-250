import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { auth } from "../auth/auth";
import { db, schema } from "../db";
import {
	isSavedVisitStatus,
	isVisitStatus,
	type VisitStatus,
	type VisitStatusMap,
} from "./types";

/**
 * Resolve the signed-in user's id from the incoming request, or `null` when
 * the request is unauthenticated. Server-only.
 */
async function getUserId(): Promise<string | null> {
	const { headers } = getRequest();
	const session = await auth.api.getSession({ headers });
	return session?.user.id ?? null;
}

/**
 * Return every saved visit status for the current user as a
 * `{ bellId: "want" | "been" }` map. Unauthenticated requests get an empty
 * map rather than an error, so the UI can render its default (no status).
 */
export const getVisitStatuses = createServerFn({ method: "GET" }).handler(
	async (): Promise<VisitStatusMap> => {
		const userId = await getUserId();
		if (!userId) return {};

		const rows = await db
			.select({
				bellId: schema.visited.bellId,
				status: schema.visited.status,
			})
			.from(schema.visited)
			.where(eq(schema.visited.userId, userId));

		const statuses: VisitStatusMap = {};
		for (const { bellId, status } of rows) {
			if (isSavedVisitStatus(status)) {
				statuses[bellId] = status;
			}
		}
		return statuses;
	},
);

type SetVisitStatusInput = {
	bellId: string;
	status: VisitStatus;
};

/**
 * Set (or clear) the current user's status for a bell. Requires authentication.
 */
export const setVisitStatus = createServerFn({ method: "POST" })
	.validator((data: SetVisitStatusInput): SetVisitStatusInput => {
		if (
			!data ||
			typeof data.bellId !== "string" ||
			data.bellId.length === 0 ||
			!isVisitStatus(data.status)
		) {
			throw new Error("Invalid visit status payload.");
		}
		return { bellId: data.bellId, status: data.status };
	})
	.handler(async ({ data }): Promise<{ status: VisitStatus }> => {
		const userId = await getUserId();
		if (!userId) {
			throw new Error("You must be signed in to save a bell.");
		}

		const { bellId, status } = data;

		if (status === "none") {
			await db
				.delete(schema.visited)
				.where(
					and(
						eq(schema.visited.userId, userId),
						eq(schema.visited.bellId, bellId),
					),
				);
		} else {
			await db
				.insert(schema.visited)
				.values({ userId, bellId, status })
				.onConflictDoUpdate({
					target: [schema.visited.userId, schema.visited.bellId],
					set: { status, updatedAt: new Date() },
				});
		}

		return { status };
	});
