import type {
	BellFilters,
	PlacementFilter,
} from "../../../lib/bells/filterBells";
import {
	filtersAreDefault,
	filtersEqual,
} from "../../../lib/bells/filterBells";
import { Button } from "../../../components/Button/Button";
import { MultiSelect } from "../../../components/MultiSelect/MultiSelect";
import { SegmentedControl } from "../../../components/SegmentedControl/SegmentedControl";
import styles from "./BellsFilters.module.css";

type Props = {
	countyOptions: string[];
	draft: BellFilters;
	onDraftChange: (filters: BellFilters) => void;
	onApply: () => void;
	onClear: () => void;
	applied: BellFilters;
	resultSummary: string | null;
};

const PLACEMENT_OPTIONS: { value: PlacementFilter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "outdoors", label: "Outdoor" },
	{ value: "indoors", label: "Indoor" },
];

export function BellsFilters({
	countyOptions,
	draft,
	onDraftChange,
	onApply,
	onClear,
	applied,
	resultSummary,
}: Props) {
	const canApply = !filtersEqual(draft, applied);
	const canClear = !filtersAreDefault(applied);

	const countySelectOptions = countyOptions.map((county) => ({
		value: county,
		label: `${county} County`,
	}));

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
