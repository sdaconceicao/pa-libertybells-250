import {
	Button,
	Checkbox,
	MultiSelect,
	MultiSelectItem,
	SegmentedControl,
	SegmentedControlItem,
	Select,
	SelectItem,
} from "@code-x/lago";
import { Building2, MapPin, Trees } from "lucide-react";
import type { Key, ReactNode } from "react";
import type {
	BellFilters,
	PlacementFilter,
} from "../../../lib/bells/filterBells";
import {
	DISTANCE_OPTIONS_MILES,
	filtersAreDefault,
	filtersEqual,
} from "../../../lib/bells/filterBells";
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

type PlacementOption = {
	value: PlacementFilter;
	label: string;
	icon?: ReactNode;
};

const PLACEMENT_OPTIONS: PlacementOption[] = [
	{ value: "all", label: "All" },
	{
		value: "outdoors",
		label: "Outdoor",
		icon: <Trees size={14} aria-hidden="true" />,
	},
	{
		value: "indoors",
		label: "Indoor",
		icon: <Building2 size={14} aria-hidden="true" />,
	},
];

/** The dropdown value that represents "no distance limit". */
const ANY_DISTANCE = "any";

const DISTANCE_OPTIONS: { value: string; label: string }[] = [
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
				<span className={styles.legend}>County</span>
				<MultiSelect
					aria-label="County"
					placeholder="All counties"
					className={styles.control}
					value={draft.counties}
					onChange={(counties) =>
						onDraftChange({ ...draft, counties: counties.map(String) })
					}
				>
					{countySelectOptions.map((option) => (
						<MultiSelectItem key={option.value} id={option.value}>
							{option.label}
						</MultiSelectItem>
					))}
				</MultiSelect>
			</fieldset>

			<fieldset className={styles.fieldset}>
				<span className={styles.legend}>Placement</span>
				<SegmentedControl
					aria-label="Placement"
					className={styles.control}
					disallowEmptySelection
					selectedKeys={new Set([draft.placement])}
					onSelectionChange={(keys) => {
						const [next] = keys;
						if (next != null) {
							onDraftChange({ ...draft, placement: next as PlacementFilter });
						}
					}}
				>
					{PLACEMENT_OPTIONS.map((option) => (
						<SegmentedControlItem key={option.value} id={option.value}>
							{option.icon}
							{option.label}
						</SegmentedControlItem>
					))}
				</SegmentedControl>
				{draft.placement !== "all" ? (
					<p className={styles.helper}>
						Bells without indoor/outdoor information are hidden.
					</p>
				) : null}
			</fieldset>

			<fieldset className={styles.fieldset}>
				<span className={styles.legend}>Distance</span>
				<Select
					aria-label="Distance from my location"
					placeholder="Any distance"
					className={styles.control}
					selectedKey={distanceToValue(draft.maxDistanceMiles)}
					onSelectionChange={(key: Key | null) => {
						if (key != null) {
							handleDistanceChange(String(key));
						}
					}}
				>
					{DISTANCE_OPTIONS.map((option) => (
						<SelectItem key={option.value} id={option.value}>
							{option.label}
						</SelectItem>
					))}
				</Select>
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
							isSelected={visitedFilter.want}
							onChange={(want) =>
								onVisitedFilterChange({ ...visitedFilter, want })
							}
						>
							Want to go
						</Checkbox>
						<Checkbox
							isSelected={visitedFilter.been}
							onChange={(been) =>
								onVisitedFilterChange({ ...visitedFilter, been })
							}
						>
							Been there
						</Checkbox>
						<Checkbox
							isSelected={visitedFilter.none}
							onChange={(none) =>
								onVisitedFilterChange({ ...visitedFilter, none })
							}
						>
							Neither
						</Checkbox>
					</div>
				</fieldset>
			) : null}

			{resultSummary ? (
				<p className={styles.resultSummary}>{resultSummary}</p>
			) : null}

			<div className={styles.actions}>
				<Button
					variant="primary"
					className={styles.actionButton}
					onPress={onApply}
					isDisabled={!canApply}
				>
					Apply filters
				</Button>
				<Button
					variant="secondary"
					className={styles.actionButton}
					onPress={onClear}
					isDisabled={!canClear}
				>
					Clear filters
				</Button>
			</div>
		</section>
	);
}
