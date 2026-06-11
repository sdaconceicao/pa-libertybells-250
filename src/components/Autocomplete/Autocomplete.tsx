import {
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import styles from "./Autocomplete.module.css";

export type AutocompleteResultsProps<T> = {
	items: T[];
	activeIndex: number;
	getOptionId: (index: number) => string;
	getOptionClassName: (index: number) => string;
	onActiveIndexChange: (index: number) => void;
	onSelect: (item: T) => void;
};

type Props<T> = {
	value: string;
	onValueChange: (value: string) => void;
	items: T[];
	getItemKey: (item: T) => string;
	label: string;
	placeholder?: string;
	resultsLabel: string;
	emptyMessage?: string;
	className?: string;
	inputPrefix?: ReactNode;
	onSelect?: (item: T) => void;
	renderResults: (props: AutocompleteResultsProps<T>) => ReactNode;
};

export function Autocomplete<T>({
	value,
	onValueChange,
	items,
	getItemKey,
	label,
	placeholder,
	resultsLabel,
	emptyMessage,
	className,
	inputPrefix,
	onSelect,
	renderResults,
}: Props<T>) {
	const rootRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const searchId = useId();
	const listboxId = useId();
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const shouldScrollActiveOptionRef = useRef(false);

	const showResults = open && value.trim().length > 0;

	const close = useCallback(() => {
		setOpen(false);
		setActiveIndex(-1);
	}, []);

	const selectItem = useCallback(
		(item: T) => {
			onSelect?.(item);
			onValueChange("");
			close();
			inputRef.current?.blur();
		},
		[close, onSelect, onValueChange],
	);

	useEffect(() => {
		setActiveIndex(-1);
	}, []);

	useEffect(() => {
		if (!showResults) {
			return;
		}

		const handlePointerDown = (event: MouseEvent) => {
			const root = rootRef.current;
			if (!root?.contains(event.target as Node)) {
				close();
			}
		};

		document.addEventListener("mousedown", handlePointerDown);

		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
		};
	}, [close, showResults]);

	const moveActiveIndex = useCallback(
		(direction: 1 | -1) => {
			if (items.length === 0) {
				return;
			}

			shouldScrollActiveOptionRef.current = true;

			setActiveIndex((current) => {
				if (current === -1) {
					return direction === 1 ? 0 : items.length - 1;
				}

				const nextIndex = current + direction;
				if (nextIndex < 0) {
					return 0;
				}
				if (nextIndex >= items.length) {
					return items.length - 1;
				}
				return nextIndex;
			});
		},
		[items.length],
	);

	const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Escape") {
			event.preventDefault();
			close();
			inputRef.current?.blur();
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setOpen(true);
			moveActiveIndex(1);
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			setOpen(true);
			moveActiveIndex(-1);
			return;
		}

		if (event.key === "Enter" && activeIndex >= 0 && items[activeIndex]) {
			event.preventDefault();
			selectItem(items[activeIndex]);
		}
	};

	const getOptionId = useCallback(
		(index: number) => `${listboxId}-option-${getItemKey(items[index])}`,
		[getItemKey, items, listboxId],
	);

	const getOptionClassName = useCallback(
		(index: number) =>
			[styles.option, index === activeIndex ? styles.optionActive : ""]
				.filter(Boolean)
				.join(" "),
		[activeIndex],
	);

	useLayoutEffect(() => {
		if (
			!shouldScrollActiveOptionRef.current ||
			!showResults ||
			activeIndex < 0 ||
			!items[activeIndex]
		) {
			return;
		}

		shouldScrollActiveOptionRef.current = false;
		const option = document.getElementById(getOptionId(activeIndex));
		option?.scrollIntoView?.({ block: "nearest" });
	}, [activeIndex, getOptionId, items, showResults]);

	const rootClassName = [styles.root, className].filter(Boolean).join(" ");
	const activeOptionId =
		showResults && activeIndex >= 0 && items[activeIndex]
			? getOptionId(activeIndex)
			: undefined;

	return (
		<div className={rootClassName} ref={rootRef}>
			<div className={styles.inputWrap}>
				{inputPrefix ? (
					<span className={styles.inputPrefix}>{inputPrefix}</span>
				) : null}
				<label className={styles.searchLabel} htmlFor={searchId}>
					{label}
				</label>
				<input
					ref={inputRef}
					id={searchId}
					type="search"
					className={styles.searchInput}
					value={value}
					placeholder={placeholder}
					role="combobox"
					aria-expanded={showResults}
					aria-controls={showResults ? listboxId : undefined}
					aria-autocomplete="list"
					aria-activedescendant={activeOptionId}
					onChange={(event) => {
						onValueChange(event.target.value);
						setOpen(true);
					}}
					onFocus={() => {
						if (value.trim().length > 0) {
							setOpen(true);
						}
					}}
					onKeyDown={handleInputKeyDown}
				/>
			</div>

			{showResults ? (
				<div
					id={listboxId}
					className={styles.results}
					role="listbox"
					aria-label={resultsLabel}
				>
					{items.length === 0 ? (
						emptyMessage ? (
							<p className={styles.emptyMessage}>{emptyMessage}</p>
						) : null
					) : (
						renderResults({
							items,
							activeIndex,
							getOptionId,
							getOptionClassName,
							onActiveIndexChange: setActiveIndex,
							onSelect: selectItem,
						})
					)}
				</div>
			) : null}
		</div>
	);
}
