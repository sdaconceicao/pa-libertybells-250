import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { VisitStatus, VisitStatusMap } from "./types";
import { getVisitStatuses, setVisitStatus } from "./visitsApi";
import { useAuth } from "../auth/authClient";

type VisitStatusContextValue = {
	/** Whether a user is signed in (statuses can only be saved when true). */
	isAuthed: boolean;
	/** The current user's saved status for a bell. */
	getStatus: (bellId: string) => VisitStatus;
	/**
	 * Persist a new status for a bell. Updates local state optimistically and
	 * reverts if the server call fails. Rejects if the user is not signed in.
	 */
	setStatus: (bellId: string, status: VisitStatus) => Promise<void>;
};

const VisitStatusContext = createContext<VisitStatusContextValue | null>(null);

export function VisitStatusProvider({ children }: { children: ReactNode }) {
	const { user, isAuthed } = useAuth();
	const userId = user?.id ?? null;

	const [statuses, setStatuses] = useState<VisitStatusMap>({});
	// Track which user the loaded statuses belong to so we refetch on login and
	// clear on logout / account switch.
	const loadedForUser = useRef<string | null>(null);

	useEffect(() => {
		if (!userId) {
			loadedForUser.current = null;
			setStatuses({});
			return;
		}
		if (loadedForUser.current === userId) return;
		loadedForUser.current = userId;

		let cancelled = false;
		getVisitStatuses()
			.then((result) => {
				if (!cancelled) setStatuses(result);
			})
			.catch(() => {
				// Leave statuses empty; the UI just shows the default state.
			});
		return () => {
			cancelled = true;
		};
	}, [userId]);

	const getStatus = useCallback(
		(bellId: string): VisitStatus => statuses[bellId] ?? "none",
		[statuses],
	);

	const setStatus = useCallback(
		async (bellId: string, status: VisitStatus) => {
			if (!userId) {
				throw new Error("Not signed in");
			}

			const previous = statuses[bellId];
			setStatuses((current) => {
				const next = { ...current };
				if (status === "none") {
					delete next[bellId];
				} else {
					next[bellId] = status;
				}
				return next;
			});

			try {
				await setVisitStatus({ data: { bellId, status } });
			} catch (error) {
				// Revert on failure.
				setStatuses((current) => {
					const next = { ...current };
					if (previous) {
						next[bellId] = previous;
					} else {
						delete next[bellId];
					}
					return next;
				});
				throw error;
			}
		},
		[statuses, userId],
	);

	return (
		<VisitStatusContext.Provider value={{ isAuthed, getStatus, setStatus }}>
			{children}
		</VisitStatusContext.Provider>
	);
}

const FALLBACK: VisitStatusContextValue = {
	isAuthed: false,
	getStatus: () => "none",
	setStatus: async () => {},
};

/**
 * Read the visit-status context. When rendered outside a provider the toggle
 * simply shows its default (signed-out) state rather than crashing, so a bell
 * popup can be rendered in isolation (tests, storybook) without extra setup.
 */
export function useVisitStatuses(): VisitStatusContextValue {
	return useContext(VisitStatusContext) ?? FALLBACK;
}
