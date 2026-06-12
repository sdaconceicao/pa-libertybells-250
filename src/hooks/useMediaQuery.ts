import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			const mediaQuery = window.matchMedia(query);
			mediaQuery.addEventListener("change", onStoreChange);

			return () => {
				mediaQuery.removeEventListener("change", onStoreChange);
			};
		},
		[query],
	);

	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		// The server cannot know the viewport; assume desktop and let CSS
		// media queries control what is visible until hydration completes.
		() => false,
	);
}
