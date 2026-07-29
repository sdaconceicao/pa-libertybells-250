import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import bellsData from "../lib/bells/bells.data.json";
import type { Bell } from "../lib/bells/types";
import { BellsMap } from "./-components/BellsMap";
import { FloatingSidebar } from "./-components/FloatingSidebar/FloatingSidebar";
import { HeaderDesktop } from "./-components/HeaderDesktop/HeaderDesktop";
import { HeaderMobile } from "./-components/HeaderMobile/HeaderMobile";
import { MobileList } from "./-components/MobileList/MobileList";
import { MobileViewToggle } from "./-components/MobileViewToggle/MobileViewToggle";
import { useGeolocation } from "../hooks/useGeolocation";
import { useBellSelection } from "./-hooks/useBellSelection";
import { useBellsFilters } from "./-hooks/useBellsFilters";
import { useBellsPageLayout } from "./-hooks/useBellsPageLayout";
import { useVisitedFilter } from "./-hooks/useVisitedFilter";
import styles from "./index.module.css";

export const Route = createFileRoute("/")({
	loader: async () => {
		// Data is statically generated; just return it typed.
		return bellsData as Bell[];
	},
	component: BellsPage,
});

function BellsPage() {
	const bells = Route.useLoaderData();
	const {
		isMobile,
		isHydrated,
		sidebarOpen,
		openSidebar,
		closeSidebar,
		mobileView,
		showMap,
		showList,
	} = useBellsPageLayout();
	const {
		coords: userLocation,
		status: locationStatus,
		error: locationError,
		request: requestLocation,
	} = useGeolocation();
	const {
		draft,
		applied,
		setDraft,
		applyFilters,
		clearFilters,
		countyOptions,
		filteredBells,
		hasActiveFilters,
		resultSummary,
	} = useBellsFilters(bells, userLocation);
	const {
		isAuthed: showVisitedFilter,
		draft: visitedDraft,
		applied: visitedApplied,
		setDraft: setVisitedDraft,
		applyVisited,
		clearVisited,
		applyVisitedFilter,
	} = useVisitedFilter();

	// Apply and clear both filter sets together, so the shared Apply/Clear
	// buttons drive the static filters and the visited filter in lockstep.
	const handleApplyFilters = useCallback(() => {
		applyFilters();
		applyVisited();
	}, [applyFilters, applyVisited]);
	const handleClearFilters = useCallback(() => {
		clearFilters();
		clearVisited();
	}, [clearFilters, clearVisited]);

	// Apply the per-user "Visited" filter on top of the static filters so the
	// map, list, and selection all operate on the same visible set.
	const visibleBells = useMemo(
		() => applyVisitedFilter(filteredBells),
		[applyVisitedFilter, filteredBells],
	);
	const {
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
	} = useBellSelection({
		filteredBells: visibleBells,
		isMobile,
		mobileView,
		showMap,
		showList,
	});

	const showMobileMap = isMobile && mobileView === "map";
	const showDesktopMap = !isMobile;
	const mapVisible = showMobileMap || showDesktopMap;
	const showMapHeader = mapVisible && (isMobile || !sidebarOpen);

	// Until hydration the viewport is unknown, so render both the mobile and
	// desktop layouts and let CSS media queries decide which one is visible.
	// Once hydrated, prune whichever layout doesn't apply.
	const renderMobileList = mobileView === "list" && (isMobile || !isHydrated);
	const renderMobileToggle = isMobile || !isHydrated;
	const renderDesktopSidebar = !isMobile;
	const showInstallBanner =
		renderMobileToggle && !(mobileView === "list" && selectedBell);

	const bellsPanelProps = {
		bells: visibleBells,
		hasActiveFilters,
		onBellHover: handleBellHover,
		onBellSelect: handleBellSelect,
		countyOptions,
		draft,
		applied,
		onDraftChange: setDraft,
		onApply: handleApplyFilters,
		onClear: handleClearFilters,
		resultSummary,
		showVisitedFilter,
		visitedFilter: visitedDraft,
		appliedVisitedFilter: visitedApplied,
		onVisitedFilterChange: setVisitedDraft,
		onRequestLocation: requestLocation,
		locationStatus,
		locationError,
		selectedBell,
		bellNavigation,
		onClearSelection: handleClearSelection,
		onPreviousBell: handlePreviousBell,
		onNextBell: handleNextBell,
	};

	return (
		<main className={styles.page}>
			<div
				className={[
					styles.mapLayer,
					mapVisible ? styles.mapLayerVisible : styles.mapLayerHidden,
				]
					.filter(Boolean)
					.join(" ")}
				aria-hidden={!mapVisible}
			>
				<BellsMap
					bells={visibleBells}
					sidebarOpen={sidebarOpen}
					isMobile={isMobile}
					highlightRef={highlightBellRef}
					selectedBellId={selectedBellId}
					onBellSelect={handleBellSelect}
				/>
				{showMapHeader ? (
					isMobile ? (
						<HeaderMobile
							bells={visibleBells}
							onBellHover={handleBellHover}
							onBellSelect={handleBellSelect}
							showInstallBanner={showInstallBanner && mobileView === "map"}
						/>
					) : (
						<HeaderDesktop
							bells={visibleBells}
							onBellHover={handleBellHover}
							onBellSelect={handleBellSelect}
						/>
					)
				) : null}
			</div>

			{renderMobileList ? (
				<MobileList
					{...bellsPanelProps}
					showInstallBanner={showInstallBanner}
				/>
			) : null}

			{renderDesktopSidebar ? (
				<FloatingSidebar
					isOpen={sidebarOpen}
					onClose={closeSidebar}
					onOpen={openSidebar}
					{...bellsPanelProps}
				/>
			) : null}

			{renderMobileToggle ? (
				<MobileViewToggle
					activeView={mobileView}
					onShowMap={showMap}
					onShowList={handleShowList}
				/>
			) : null}
		</main>
	);
}
