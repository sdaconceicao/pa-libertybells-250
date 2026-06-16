import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import bellsData from "../lib/bells/bells.data.json";
import type { Bell } from "../lib/bells/types";
import { BellPopupContent } from "./-components/BellPopupContent/BellPopupContent";
import { BellSearch } from "./-components/BellSearch/BellSearch";
import { BellsFilters } from "./-components/BellsFilters/BellsFilters";
import { BellsList } from "./-components/BellsList/BellsList";
import { BellsMap } from "./-components/BellsMap";
import { FloatingSidebar } from "./-components/FloatingSidebar/FloatingSidebar";
import { ListHeader } from "./-components/ListHeader/ListHeader";
import { Logo } from "./-components/Logo/Logo";
import { InstallBanner } from "./-components/InstallBanner/InstallBanner";
import { MobileViewToggle } from "./-components/MobileViewToggle/MobileViewToggle";
import { useBellsFilters } from "./-hooks/useBellsFilters";
import { useBellsPageLayout } from "./-hooks/useBellsPageLayout";
import { getBellNavigation } from "./-utils/getBellNavigation";
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

	const selectedBellPanel = selectedBell ? (
		<BellPopupContent
			bell={selectedBell}
			variant="sidebar"
			onClose={handleClearSelection}
			onPrevious={handlePreviousBell}
			onNext={handleNextBell}
			hasPrevious={!!bellNavigation?.previousId}
			hasNext={!!bellNavigation?.nextId}
			listPosition={bellNavigation?.position}
			listTotal={bellNavigation?.total ?? 0}
		/>
	) : null;

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
		renderMobileToggle && !(mobileView === "list" && selectedBellPanel);

	const listEmptyMessage = hasActiveFilters
		? "No bells match these filters."
		: "No bells are loaded yet.";

	const renderListHeader = (variant: "mobile" | "desktop") => (
		<ListHeader
			bells={filteredBells}
			onBellHover={handleBellHover}
			onBellSelect={handleBellSelect}
			variant={variant}
		/>
	);

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
				{showMapHeader ? (
					isMobile ? (
						<>
							<div
								className={[styles.mapHeader, styles.mapHeaderMobile]
									.filter(Boolean)
									.join(" ")}
							>
								<ListHeader
									bells={filteredBells}
									onBellHover={handleBellHover}
									onBellSelect={handleBellSelect}
									variant="mobileMap"
								/>
							</div>
							{showInstallBanner && mobileView === "map" ? (
								<InstallBanner variant="map" />
							) : null}
						</>
					) : (
						<>
							<div
								className={[styles.mapHeader, styles.mapHeaderDesktop]
									.filter(Boolean)
									.join(" ")}
							>
								<BellSearch
									bells={filteredBells}
									onBellHover={handleBellHover}
									onBellSelect={handleBellSelect}
									className={styles.mapHeaderSearch}
								/>
							</div>
							<Logo variant="circle" className={styles.mapLogoDesktop} />
						</>
					)
				) : null}
			</div>

			{renderMobileList ? (
				<section className={styles.mobileListLayer}>
					<>
						<header className={styles.mobileListHeader}>
							{renderListHeader("mobile")}
						</header>
						{showInstallBanner ? <InstallBanner variant="list" /> : null}
					</>
					<div className={styles.panelStack}>
						{selectedBellPanel ? (
							<div className={styles.selectedBellSection}>
								{selectedBellPanel}
							</div>
						) : (
							filtersPanel
						)}
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

			{renderDesktopSidebar ? (
				<FloatingSidebar
					isOpen={sidebarOpen}
					onClose={closeSidebar}
					onOpen={openSidebar}
					header={sidebarOpen ? renderListHeader("desktop") : undefined}
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
