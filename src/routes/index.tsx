import { createFileRoute } from "@tanstack/react-router";
import bellsData from "../lib/bells/bells.data.json";
import type { Bell } from "../lib/bells/types";
import { BellsList } from "../components/BellsList/BellsList";
import { BellsMap } from "../components/BellsMap";
import { FloatingHeader } from "../components/FloatingHeader/FloatingHeader";
import { FloatingSidebar } from "../components/FloatingSidebar/FloatingSidebar";
import { MobileViewToggle } from "../components/MobileViewToggle/MobileViewToggle";
import { useBellsPageLayout } from "../hooks/useBellsPageLayout";
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

	const showMobileMap = isMobile && mobileView === "map";
	const showMobileList = isMobile && mobileView === "list";
	const showDesktopMap = !isMobile;
	const mapVisible = showMobileMap || showDesktopMap;

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
				<BellsMap bells={bells} sidebarOpen={sidebarOpen} isMobile={isMobile} />
			</div>

			{showMobileList ? (
				<section className={styles.mobileListLayer}>
					<BellsList bells={bells} className={styles.mobileList} />
				</section>
			) : null}

			<FloatingHeader
				bellCount={bells.length}
				sidebarOpen={sidebarOpen}
				isMobile={isMobile}
			/>

			{!isMobile ? (
				<FloatingSidebar
					isOpen={sidebarOpen}
					onClose={closeSidebar}
					onOpen={openSidebar}
				>
					<BellsList bells={bells} className={styles.sidebarList} />
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
