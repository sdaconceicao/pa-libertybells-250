import { useCallback, useState, useSyncExternalStore } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export type MobileView = "map" | "list";

export const MOBILE_BREAKPOINT = "(max-width: 767px)";

const emptySubscribe = () => () => {};

export function useBellsPageLayout() {
	const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
	// False on the server and during hydration, true once the client has
	// rendered and `isMobile` reflects the real viewport.
	const isHydrated = useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [mobileView, setMobileView] = useState<MobileView>("list");

	const openSidebar = useCallback(() => {
		setSidebarOpen(true);
	}, []);

	const closeSidebar = useCallback(() => {
		setSidebarOpen(false);
	}, []);

	const showMap = useCallback(() => {
		setMobileView("map");
	}, []);

	const showList = useCallback(() => {
		setMobileView("list");
	}, []);

	return {
		isMobile,
		isHydrated,
		sidebarOpen,
		setSidebarOpen,
		openSidebar,
		closeSidebar,
		mobileView,
		setMobileView,
		showMap,
		showList,
	};
}
