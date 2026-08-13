import { SearchFieldWithSuggestions } from "@code-x/lago";
import { useCallback, useMemo, useState } from "react";
import { searchBells } from "../../../lib/bells/searchBells";
import type { Bell } from "../../../lib/bells/types";
import { BellContentBody } from "../BellContent/BellContent";
import styles from "./BellSearch.module.css";

type Props = {
	bells: Bell[];
	className?: string;
	onBellHover?: (bellId: string | null) => void;
	onBellSelect?: (bellId: string) => void;
};

export function BellSearch({
	bells,
	className,
	onBellHover,
	onBellSelect,
}: Props) {
	const [query, setQuery] = useState("");

	// A suggestion only carries `id` and `label`, so renderSuggestion looks the
	// bell back up to draw its thumbnail and details.
	const bellsById = useMemo(
		() => new Map(bells.map((bell) => [bell.id, bell])),
		[bells],
	);

	// searchBells matches on title AND artist. Feed it through loadSuggestions
	// (whose results are shown verbatim) rather than the `suggestions` prop,
	// which would re-filter with a contains-match on `label` and drop
	// artist-only matches.
	const loadSuggestions = useCallback(
		async (value: string) =>
			searchBells(bells, value).map((bell) => ({
				id: bell.id,
				label: bell.title,
			})),
		[bells],
	);

	return (
		<SearchFieldWithSuggestions
			className={className}
			aria-label="Search bells by title or artist"
			placeholder="Search titles or artists"
			value={query}
			debounceDelay={0}
			onChange={setQuery}
			loadSuggestions={loadSuggestions}
			renderSuggestion={(suggestion) => {
				const bell = bellsById.get(suggestion.id);
				if (!bell) {
					return suggestion.label;
				}

				return (
					<div
						className={styles.suggestion}
						onPointerEnter={() => onBellHover?.(bell.id)}
						onPointerLeave={() => onBellHover?.(null)}
					>
						<BellContentBody bell={bell} />
					</div>
				);
			}}
			onSuggestionSelect={(suggestion) => {
				// The dropdown unmounts on select, so mouseleave may never fire and
				// the map would keep the row highlighted.
				onBellHover?.(null);
				onBellSelect?.(suggestion.id);
				setQuery("");
			}}
		/>
	);
}
