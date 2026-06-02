import { useCallback, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export type MobileView = "map" | "list";

export const MOBILE_BREAKPOINT = "(max-width: 767px)";

export function useBellsPageLayout() {
	const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [mobileView, setMobileView] = useState<MobileView>("map");

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
