import { BellVisitStatus } from "../BellVisitStatus/BellVisitStatus";
import type { BellFilters } from "../../../lib/bells/filterBells";
import type { GeolocationStatus } from "../../../hooks/useGeolocation";
import type { Bell } from "../../../lib/bells/types";
import type { VisitedFilter } from "../../../lib/visits/visitedFilter";
import type { BellNavigation } from "../../-utils/getBellNavigation";
import { BellPopupContent } from "../BellPopupContent/BellPopupContent";
import { BellsFilters } from "../BellsFilters/BellsFilters";
import { BellsList } from "../BellsList/BellsList";
import styles from "./BellsPanelContent.module.css";

export type FiltersPlacement = "replace" | "stack";

export type BellsPanelContentProps = {
	bells: Bell[];
	hasActiveFilters: boolean;
	onBellHover: (bellId: string | null) => void;
	onBellSelect: (bellId: string) => void;
	filtersPlacement: FiltersPlacement;
	listVariant?: "default" | "mobile";
	countyOptions: string[];
	draft: BellFilters;
	applied: BellFilters;
	onDraftChange: (filters: BellFilters) => void;
	onApply: () => void;
	onClear: () => void;
	resultSummary: string | null;
	selectedBell: Bell | null;
	bellNavigation: BellNavigation | null;
	onClearSelection: () => void;
	onPreviousBell: () => void;
	onNextBell: () => void;
	showVisitedFilter: boolean;
	visitedFilter: VisitedFilter;
	appliedVisitedFilter: VisitedFilter;
	onVisitedFilterChange: (filter: VisitedFilter) => void;
	onRequestLocation: () => void;
	locationStatus: GeolocationStatus;
	locationError: string | null;
};

export function BellsPanelContent({
	bells,
	hasActiveFilters,
	onBellHover,
	onBellSelect,
	filtersPlacement,
	listVariant = "default",
	countyOptions,
	draft,
	applied,
	onDraftChange,
	onApply,
	onClear,
	resultSummary,
	selectedBell,
	bellNavigation,
	onClearSelection,
	onPreviousBell,
	onNextBell,
	showVisitedFilter,
	visitedFilter,
	appliedVisitedFilter,
	onVisitedFilterChange,
	onRequestLocation,
	locationStatus,
	locationError,
}: BellsPanelContentProps) {
	const showFilters = filtersPlacement === "stack" || !selectedBell;
	const emptyMessage = hasActiveFilters
		? "No bells match these filters."
		: "No bells are loaded yet.";
	const listClassName = [
		styles.list,
		listVariant === "mobile" ? styles.listMobile : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={styles.panelStack}>
			{selectedBell ? (
				<div className={styles.selectedSection}>
					<BellPopupContent
						bell={selectedBell}
						variant="sidebar"
						onClose={onClearSelection}
						onPrevious={onPreviousBell}
						onNext={onNextBell}
						hasPrevious={!!bellNavigation?.previousId}
						hasNext={!!bellNavigation?.nextId}
						listPosition={bellNavigation?.position}
						listTotal={bellNavigation?.total ?? 0}
						actions={<BellVisitStatus bellId={selectedBell.id} />}
					/>
				</div>
			) : null}
			{showFilters ? (
				<BellsFilters
					countyOptions={countyOptions}
					draft={draft}
					applied={applied}
					onDraftChange={onDraftChange}
					onApply={onApply}
					onClear={onClear}
					resultSummary={resultSummary}
					showVisitedFilter={showVisitedFilter}
					visitedFilter={visitedFilter}
					appliedVisitedFilter={appliedVisitedFilter}
					onVisitedFilterChange={onVisitedFilterChange}
					onRequestLocation={onRequestLocation}
					locationStatus={locationStatus}
					locationError={locationError}
				/>
			) : null}
			<BellsList
				bells={bells}
				className={listClassName}
				emptyMessage={emptyMessage}
				onBellHover={onBellHover}
				onBellSelect={onBellSelect}
			/>
		</div>
	);
}
