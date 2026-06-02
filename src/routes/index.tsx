import { createFileRoute } from "@tanstack/react-router";
import bellsData from "../lib/bells/bells.data.json";
import type { Bell } from "../lib/bells/types";
import { BellsFilters } from "./-components/BellsFilters/BellsFilters";
import { BellsList } from "./-components/BellsList/BellsList";
import { BellsMap } from "./-components/BellsMap";
import { FloatingSidebar } from "./-components/FloatingSidebar/FloatingSidebar";
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

	const showMobileMap = isMobile && mobileView === "map";
	const showMobileList = isMobile && mobileView === "list";
	const showDesktopMap = !isMobile;
	const mapVisible = showMobileMap || showDesktopMap;

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
				/>
			</div>

			{showMobileList ? (
				<section className={styles.mobileListLayer}>
					<div className={styles.panelStack}>
						{filtersPanel}
						<BellsList
							bells={filteredBells}
							className={styles.mobileList}
							emptyMessage={listEmptyMessage}
						/>
					</div>
				</section>
			) : null}

			{!isMobile ? (
				<FloatingSidebar
					isOpen={sidebarOpen}
					onClose={closeSidebar}
					onOpen={openSidebar}
				>
					<div className={styles.panelStack}>
						{filtersPanel}
						<BellsList
							bells={filteredBells}
							className={styles.sidebarList}
							emptyMessage={listEmptyMessage}
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
