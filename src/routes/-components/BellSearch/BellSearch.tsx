import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Autocomplete } from "../../../components/Autocomplete/Autocomplete";
import { searchBells } from "../../../lib/bells/searchBells";
import type { Bell } from "../../../lib/bells/types";
import { BellContent } from "../BellContent/BellContent";
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
	const results = useMemo(() => searchBells(bells, query), [bells, query]);

	return (
		<Autocomplete
			value={query}
			onValueChange={setQuery}
			items={results}
			getItemKey={(bell) => bell.id}
			label="Search bells by title or artist"
			placeholder="Search titles or artists"
			resultsLabel="Bell search results"
			emptyMessage="No bells match your search."
			className={className}
			inputPrefix={
				<Search size={16} className={styles.searchIcon} aria-hidden="true" />
			}
			onSelect={(bell) => onBellSelect?.(bell.id)}
			renderResults={({
				items,
				activeIndex,
				getOptionId,
				onActiveIndexChange,
				onSelect,
			}) =>
				items.map((bell, index) => (
					<BellContent
						key={bell.id}
						bell={bell}
						optionId={getOptionId(index)}
						ariaSelected={index === activeIndex}
						isActive={index === activeIndex}
						onOptionMouseEnter={() => onActiveIndexChange(index)}
						onHover={onBellHover}
						onSelect={() => onSelect(bell)}
					/>
				))
			}
		/>
	);
}
