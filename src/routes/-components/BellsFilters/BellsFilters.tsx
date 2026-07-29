import { Building2, MapPin, Trees } from "lucide-react";
import type {
	BellFilters,
	PlacementFilter,
} from "../../../lib/bells/filterBells";
import {
	DISTANCE_OPTIONS_MILES,
	filtersAreDefault,
	filtersEqual,
} from "../../../lib/bells/filterBells";
import { Button } from "../../../components/Button/Button";
import { Checkbox } from "../../../components/Checkbox/Checkbox";
import { MultiSelect } from "../../../components/MultiSelect/MultiSelect";
import {
	SegmentedControl,
	type SegmentedOption,
} from "../../../components/SegmentedControl/SegmentedControl";
import { Select, type SelectOption } from "../../../components/Select/Select";
import type { GeolocationStatus } from "../../../hooks/useGeolocation";
import {
	type VisitedFilter,
	visitedFilterIsDefault,
	visitedFiltersEqual,
} from "../../../lib/visits/visitedFilter";
import styles from "./BellsFilters.module.css";

type Props = {
	countyOptions: string[];
	draft: BellFilters;
	onDraftChange: (filters: BellFilters) => void;
	onApply: () => void;
	onClear: () => void;
	applied: BellFilters;
	resultSummary: string | null;
	showVisitedFilter: boolean;
	visitedFilter: VisitedFilter;
	appliedVisitedFilter: VisitedFilter;
	onVisitedFilterChange: (filter: VisitedFilter) => void;
	/** Ask the browser for the user's location (used by the distance filter). */
	onRequestLocation: () => void;
	locationStatus: GeolocationStatus;
	locationError: string | null;
};

const PLACEMENT_OPTIONS: SegmentedOption<PlacementFilter>[] = [
	{ value: "all", label: "All" },
	{
		value: "outdoors",
		label: "Outdoor",
		icon: <Trees size={14} />,
	},
	{
		value: "indoors",
		label: "Indoor",
		icon: <Building2 size={14} />,
	},
];

/** The dropdown value that represents "no distance limit". */
const ANY_DISTANCE = "any";

const DISTANCE_OPTIONS: SelectOption<string>[] = [
	{ value: ANY_DISTANCE, label: "Any distance" },
	...DISTANCE_OPTIONS_MILES.map((miles) => ({
		value: String(miles),
		label: `Within ${miles} miles`,
	})),
];

function distanceToValue(maxDistanceMiles: number | null): string {
	return maxDistanceMiles == null ? ANY_DISTANCE : String(maxDistanceMiles);
}

function valueToDistance(value: string): number | null {
	return value === ANY_DISTANCE ? null : Number(value);
}

function getDistanceHelperText(
	status: GeolocationStatus,
	error: string | null,
): string | null {
	switch (status) {
		case "locating":
			return "Finding your location…";
		case "ready":
			return "Measured as the crow flies from your location.";
		case "error":
			return error;
		default:
			return null;
	}
}

export function BellsFilters({
	countyOptions,
	draft,
	onDraftChange,
	onApply,
	onClear,
	applied,
	resultSummary,
	showVisitedFilter,
	visitedFilter,
	appliedVisitedFilter,
	onVisitedFilterChange,
	onRequestLocation,
	locationStatus,
	locationError,
}: Props) {
	const visitedChanged =
		showVisitedFilter &&
		!visitedFiltersEqual(visitedFilter, appliedVisitedFilter);
	const visitedNotDefault =
		showVisitedFilter && !visitedFilterIsDefault(appliedVisitedFilter);
	const canApply = !filtersEqual(draft, applied) || visitedChanged;
	const canClear = !filtersAreDefault(applied) || visitedNotDefault;

	const countySelectOptions = countyOptions.map((county) => ({
		value: county,
		label: `${county} County`,
	}));

	const handleDistanceChange = (value: string) => {
		const maxDistanceMiles = valueToDistance(value);
		onDraftChange({ ...draft, maxDistanceMiles });
		// Kick off a location lookup as soon as a radius is chosen, unless we
		// already have a fix to measure against.
		if (maxDistanceMiles != null && locationStatus !== "ready") {
			onRequestLocation();
		}
	};

	const distanceHelperText =
		draft.maxDistanceMiles != null
			? getDistanceHelperText(locationStatus, locationError)
			: null;

	return (
		<section className={styles.filters} aria-label="Filter bells">
			<h3 className={styles.heading}>Filter</h3>

			<fieldset className={styles.fieldset}>
				<label htmlFor="counties" className={styles.legend}>
					County
				</label>
				<MultiSelect
					options={countySelectOptions}
					selectedValues={draft.counties}
					onChange={(counties) => onDraftChange({ ...draft, counties })}
					emptySelectionLabel="All counties"
					multipleSelectionLabel={(count) => `${count} counties selected`}
					searchLabel="Search counties"
					emptySearchLabel="No counties match your search."
				/>
			</fieldset>

			<fieldset className={styles.fieldset}>
				<label htmlFor="placement" className={styles.legend}>
					Placement
				</label>
				<SegmentedControl
					options={PLACEMENT_OPTIONS}
					value={draft.placement}
					onChange={(placement) => onDraftChange({ ...draft, placement })}
					ariaLabel="Placement"
					helperText={
						draft.placement !== "all"
							? "Bells without indoor/outdoor information are hidden."
							: null
					}
				/>
			</fieldset>

			<fieldset className={styles.fieldset}>
				<label htmlFor="distance" className={styles.legend}>
					Distance
				</label>
				<Select
					value={distanceToValue(draft.maxDistanceMiles)}
					onChange={handleDistanceChange}
					options={DISTANCE_OPTIONS}
					ariaLabel="Distance from my location"
					placeholderValue={ANY_DISTANCE}
					fullWidth
				/>
				{distanceHelperText ? (
					<p
						className={styles.distanceHelper}
						role={locationStatus === "error" ? "alert" : undefined}
					>
						<MapPin size={12} aria-hidden="true" />
						{distanceHelperText}
					</p>
				) : null}
			</fieldset>

			{showVisitedFilter ? (
				<fieldset className={styles.fieldset}>
					<legend className={styles.legend}>Visited</legend>
					<div className={styles.visitedOptions}>
						<Checkbox
							label="Want to go"
							checked={visitedFilter.want}
							onChange={(want) =>
								onVisitedFilterChange({ ...visitedFilter, want })
							}
						/>
						<Checkbox
							label="Been there"
							checked={visitedFilter.been}
							onChange={(been) =>
								onVisitedFilterChange({ ...visitedFilter, been })
							}
						/>
						<Checkbox
							label="Neither"
							checked={visitedFilter.none}
							onChange={(none) =>
								onVisitedFilterChange({ ...visitedFilter, none })
							}
						/>
					</div>
				</fieldset>
			) : null}

			{resultSummary ? (
				<p className={styles.resultSummary}>{resultSummary}</p>
			) : null}

			<div className={styles.actions}>
				<Button
					variant="primary"
					fullWidth
					onClick={onApply}
					disabled={!canApply}
				>
					Apply filters
				</Button>
				<Button
					variant="secondary"
					fullWidth
					onClick={onClear}
					disabled={!canClear}
				>
					Clear filters
				</Button>
			</div>
		</section>
	);
}
