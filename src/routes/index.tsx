import { createFileRoute } from "@tanstack/react-router";
import bellsData from "../lib/bells/bells.data.json";
import type { Bell } from "../lib/bells/types";
import { BellPopupContent } from "./-components/BellPopupContent/BellPopupContent";
import { BellsFilters } from "./-components/BellsFilters/BellsFilters";
import { BellsList } from "./-components/BellsList/BellsList";
import { BellsMap } from "./-components/BellsMap";
import { FloatingSidebar } from "./-components/FloatingSidebar/FloatingSidebar";
import { HeaderDesktop } from "./-components/HeaderDesktop/HeaderDesktop";
import { HeaderMobile } from "./-components/HeaderMobile/HeaderMobile";
import { ListHeader } from "./-components/ListHeader/ListHeader";
import { MobileList } from "./-components/MobileList/MobileList";
import { MobileViewToggle } from "./-components/MobileViewToggle/MobileViewToggle";
import { useBellSelection } from "./-hooks/useBellSelection";
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
		filteredBells,
		isMobile,
		mobileView,
		showMap,
		showList,
	});

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
						<HeaderMobile
							bells={filteredBells}
							onBellHover={handleBellHover}
							onBellSelect={handleBellSelect}
							showInstallBanner={showInstallBanner && mobileView === "map"}
						/>
					) : (
						<HeaderDesktop
							bells={filteredBells}
							onBellHover={handleBellHover}
							onBellSelect={handleBellSelect}
						/>
					)
				) : null}
			</div>

			{renderMobileList ? (
				<MobileList
					bells={filteredBells}
					emptyMessage={listEmptyMessage}
					onBellHover={handleBellHover}
					onBellSelect={handleBellSelect}
					selectedContent={selectedBellPanel}
					filtersPanel={filtersPanel}
					showInstallBanner={showInstallBanner}
				/>
			) : null}

			{renderDesktopSidebar ? (
				<FloatingSidebar
					isOpen={sidebarOpen}
					onClose={closeSidebar}
					onOpen={openSidebar}
					header={
						sidebarOpen ? (
							<ListHeader
								bells={filteredBells}
								onBellHover={handleBellHover}
								onBellSelect={handleBellSelect}
								variant="desktop"
							/>
						) : undefined
					}
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
