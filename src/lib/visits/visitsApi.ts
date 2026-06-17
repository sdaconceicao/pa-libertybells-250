import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { auth } from "../auth/auth";
import { db, schema } from "../db";
import { isVisitStatus, type VisitStatus, type VisitStatusMap } from "./types";

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

		const [wants, beens] = await Promise.all([
			db
				.select({ bellId: schema.favorite.bellId })
				.from(schema.favorite)
				.where(eq(schema.favorite.userId, userId)),
			db
				.select({ bellId: schema.beenTo.bellId })
				.from(schema.beenTo)
				.where(eq(schema.beenTo.userId, userId)),
		]);

		const statuses: VisitStatusMap = {};
		for (const { bellId } of wants) statuses[bellId] = "want";
		// `been` wins over `want` if both rows somehow exist for the same bell.
		for (const { bellId } of beens) statuses[bellId] = "been";
		return statuses;
	},
);

type SetVisitStatusInput = {
	bellId: string;
	status: VisitStatus;
};

/**
 * Set (or clear) the current user's status for a bell. The two saved states
 * are mutually exclusive, so choosing one removes the other; choosing `none`
 * removes both. Requires authentication.
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

		if (status === "want") {
			await db
				.delete(schema.beenTo)
				.where(
					and(
						eq(schema.beenTo.userId, userId),
						eq(schema.beenTo.bellId, bellId),
					),
				);
			await db
				.insert(schema.favorite)
				.values({ userId, bellId })
				.onConflictDoNothing();
		} else if (status === "been") {
			await db
				.delete(schema.favorite)
				.where(
					and(
						eq(schema.favorite.userId, userId),
						eq(schema.favorite.bellId, bellId),
					),
				);
			await db
				.insert(schema.beenTo)
				.values({ userId, bellId })
				.onConflictDoNothing();
		} else {
			await Promise.all([
				db
					.delete(schema.favorite)
					.where(
						and(
							eq(schema.favorite.userId, userId),
							eq(schema.favorite.bellId, bellId),
						),
					),
				db
					.delete(schema.beenTo)
					.where(
						and(
							eq(schema.beenTo.userId, userId),
							eq(schema.beenTo.bellId, bellId),
						),
					),
			]);
		}

		return { status };
	});
