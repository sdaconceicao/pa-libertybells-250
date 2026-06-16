import { useCallback, useMemo, useRef, useState } from "react";
import type { Bell } from "../../lib/bells/types";
import { getBellNavigation } from "../-utils/getBellNavigation";
import type { MobileView } from "./useBellsPageLayout";

type UseBellSelectionOptions = {
	filteredBells: Bell[];
	isMobile: boolean;
	mobileView: MobileView;
	showMap: () => void;
	showList: () => void;
};

export function useBellSelection({
	filteredBells,
	isMobile,
	mobileView,
	showMap,
	showList,
}: UseBellSelectionOptions) {
	const [selectedBellId, setSelectedBellId] = useState<string | null>(null);
	const mobileCloseReturnsToMapRef = useRef(false);
	const highlightBellRef = useRef<((id: string | null) => void) | null>(null);

	const handleBellHover = useCallback((id: string | null) => {
		highlightBellRef.current?.(id);
	}, []);

	const selectedBell = useMemo(
		() =>
			selectedBellId
				? (filteredBells.find((bell) => bell.id === selectedBellId) ?? null)
				: null,
		[filteredBells, selectedBellId],
	);

	const bellNavigation = useMemo(
		() =>
			selectedBellId ? getBellNavigation(filteredBells, selectedBellId) : null,
		[filteredBells, selectedBellId],
	);

	const handleBellSelect = useCallback(
		(id: string) => {
			setSelectedBellId(id);
			if (isMobile) {
				if (mobileView === "map") {
					mobileCloseReturnsToMapRef.current = true;
				}
				showList();
			}
		},
		[isMobile, mobileView, showList],
	);

	const handleClearSelection = useCallback(() => {
		if (isMobile && mobileCloseReturnsToMapRef.current) {
			mobileCloseReturnsToMapRef.current = false;
			setSelectedBellId(null);
			showMap();
			return;
		}

		setSelectedBellId(null);
	}, [isMobile, showMap]);

	const handleShowList = useCallback(() => {
		mobileCloseReturnsToMapRef.current = false;
		showList();
	}, [showList]);

	const handlePreviousBell = useCallback(() => {
		if (bellNavigation?.previousId) {
			handleBellSelect(bellNavigation.previousId);
		}
	}, [bellNavigation?.previousId, handleBellSelect]);

	const handleNextBell = useCallback(() => {
		if (bellNavigation?.nextId) {
			handleBellSelect(bellNavigation.nextId);
		}
	}, [bellNavigation?.nextId, handleBellSelect]);

	return {
		selectedBellId,
		selectedBell,
		bellNavigation,
		highlightBellRef,
		handleBellHover,
		handleBellSelect,
		handleClearSelection,
		handleShowList,
		handlePreviousBell,
		handleNextBell,
	};
}
