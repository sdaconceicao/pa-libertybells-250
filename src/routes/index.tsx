import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import bellsData from "../lib/bells/bells.data.json";
import type { Bell } from "../lib/bells/types";
import { BellPopupContent } from "./-components/BellPopupContent/BellPopupContent";
import { BellsFilters } from "./-components/BellsFilters/BellsFilters";
import { BellsList } from "./-components/BellsList/BellsList";
import { BellsMap } from "./-components/BellsMap";
import { FloatingSidebar } from "./-components/FloatingSidebar/FloatingSidebar";
import { Logo } from "./-components/Logo/Logo";
import { MobileViewToggle } from "./-components/MobileViewToggle/MobileViewToggle";
import { useBellsFilters } from "./-hooks/useBellsFilters";
import { useBellsPageLayout } from "./-hooks/useBellsPageLayout";
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
		sidebarOpen,
		openSidebar,
		closeSidebar,
		mobileView,
		showMap,
		showList,
	} = useBellsPageLayout();
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
	} = useBellsFilters(bells);

	const [selectedBellId, setSelectedBellId] = useState<string | null>(null);
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

	const handleBellSelect = useCallback(
		(id: string) => {
			setSelectedBellId(id);
			if (isMobile) {
				showList();
			}
		},
		[isMobile, showList],
	);

	const handleClearSelection = useCallback(() => {
		setSelectedBellId(null);
	}, []);

	const selectedBellPanel = selectedBell ? (
		<BellPopupContent
			bell={selectedBell}
			variant="sidebar"
			onClose={handleClearSelection}
		/>
	) : null;

	const showMobileMap = isMobile && mobileView === "map";
	const showMobileList = isMobile && mobileView === "list";
	const showDesktopMap = !isMobile;
	const mapVisible = showMobileMap || showDesktopMap;
	const showCircleLogo = mapVisible && (isMobile || !sidebarOpen);

	const listEmptyMessage = hasActiveFilters
		? "No bells match these filters."
		: "No bells are loaded yet.";

	const filtersPanel = (
		<BellsFilters
			countyOptions={countyOptions}
			draft={draft}
			applied={applied}
			onDraftChange={setDraft}
			onApply={applyFilters}
			onClear={clearFilters}
			resultSummary={resultSummary}
		/>
	);

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
					bells={filteredBells}
					sidebarOpen={sidebarOpen}
					isMobile={isMobile}
					highlightRef={highlightBellRef}
					selectedBellId={selectedBellId}
					onBellSelect={handleBellSelect}
				/>
				{showCircleLogo ? (
					<Logo variant="circle" className={styles.mapLogo} />
				) : null}
			</div>

			{showMobileList ? (
				<section className={styles.mobileListLayer}>
					<header className={styles.mobileListHeader}>
						<Logo variant="circle" className={styles.mobileListLogo} />
					</header>
					<div className={styles.panelStack}>
						{selectedBellPanel ? (
							<div className={styles.selectedBellSection}>
								{selectedBellPanel}
							</div>
						) : null}
						{filtersPanel}
						<BellsList
							bells={filteredBells}
							className={styles.mobileList}
							emptyMessage={listEmptyMessage}
							onBellHover={handleBellHover}
							onBellSelect={handleBellSelect}
						/>
					</div>
				</section>
			) : null}

			{!isMobile ? (
				<FloatingSidebar
					isOpen={sidebarOpen}
					onClose={closeSidebar}
					onOpen={openSidebar}
					selectedContent={selectedBellPanel}
				>
					<div className={styles.panelStack}>
						{filtersPanel}
						<BellsList
							bells={filteredBells}
							className={styles.sidebarList}
							emptyMessage={listEmptyMessage}
							onBellHover={handleBellHover}
							onBellSelect={handleBellSelect}
						/>
					</div>
				</FloatingSidebar>
			) : null}

			{isMobile ? (
				<MobileViewToggle
					activeView={mobileView}
					onShowMap={showMap}
					onShowList={showList}
				/>
			) : null}
		</main>
	);
}
