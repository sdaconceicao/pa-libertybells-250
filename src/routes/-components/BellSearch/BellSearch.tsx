import { SearchFieldWithSuggestions } from "@code-x/lago";
import { useCallback, useState } from "react";
import { searchBells } from "../../../lib/bells/searchBells";
import type { Bell } from "../../../lib/bells/types";

type Props = {
	bells: Bell[];
	className?: string;
	onBellHover?: (bellId: string | null) => void;
	onBellSelect?: (bellId: string) => void;
};

export function BellSearch({ bells, className, onBellSelect }: Props) {
	const [query, setQuery] = useState("");

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
			label="Search bells by title or artist"
			placeholder="Search titles or artists"
			value={query}
			debounceDelay={0}
			onChange={setQuery}
			loadSuggestions={loadSuggestions}
			onSuggestionSelect={(suggestion) => {
				onBellSelect?.(suggestion.id);
				setQuery("");
			}}
		/>
	);
}
