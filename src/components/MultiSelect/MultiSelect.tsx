import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import styles from "./MultiSelect.module.css";

export type MultiSelectOption = {
	value: string;
	label: string;
};

type Props = {
	options: MultiSelectOption[];
	selectedValues: string[];
	onChange: (selectedValues: string[]) => void;
	emptySelectionLabel: string;
	multipleSelectionLabel: (count: number) => string;
	searchLabel: string;
	searchPlaceholder?: string;
	emptySearchLabel: string;
};

function getTriggerLabel(
	selectedValues: string[],
	options: MultiSelectOption[],
	emptySelectionLabel: string,
	multipleSelectionLabel: (count: number) => string,
): string {
	if (selectedValues.length === 0) {
		return emptySelectionLabel;
	}
	if (selectedValues.length === 1) {
		const option = options.find((item) => item.value === selectedValues[0]);
		return option?.label ?? selectedValues[0];
	}
	return multipleSelectionLabel(selectedValues.length);
}

export function MultiSelect({
	options,
	selectedValues,
	onChange,
	emptySelectionLabel,
	multipleSelectionLabel,
	searchLabel,
	searchPlaceholder = "Type to filter…",
	emptySearchLabel,
}: Props) {
	const listId = useId();
	const searchId = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const [searchText, setSearchText] = useState("");
	const [open, setOpen] = useState(false);

	const close = useCallback(() => {
		setOpen(false);
		setSearchText("");
	}, []);

	useEffect(() => {
		if (!open) {
			return;
		}

		const handlePointerDown = (event: MouseEvent) => {
			const root = rootRef.current;
			if (!root?.contains(event.target as Node)) {
				close();
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				close();
			}
		};

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, close]);

	const filteredOptions = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		if (!query) {
			return options;
		}
		return options.filter(
			(option) =>
				option.label.toLowerCase().includes(query) ||
				option.value.toLowerCase().includes(query),
		);
	}, [options, searchText]);

	const toggleValue = (value: string) => {
		if (selectedValues.includes(value)) {
			onChange(selectedValues.filter((item) => item !== value));
			return;
		}
		onChange([...selectedValues, value]);
	};

	const selectAll = () => {
		onChange(options.map((option) => option.value));
	};

	const clearSelection = () => {
		onChange([]);
	};

	return (
		<div className={styles.root} ref={rootRef}>
			<button
				type="button"
				className={styles.trigger}
				onClick={() => {
					if (open) {
						close();
						return;
					}
					setOpen(true);
				}}
				aria-expanded={open}
				aria-controls={listId}
			>
				{getTriggerLabel(
					selectedValues,
					options,
					emptySelectionLabel,
					multipleSelectionLabel,
				)}
			</button>

			{open ? (
				<div className={styles.panel}>
					<label className={styles.searchLabel} htmlFor={searchId}>
						{searchLabel}
					</label>
					<input
						id={searchId}
						type="search"
						className={styles.searchInput}
						value={searchText}
						onChange={(event) => setSearchText(event.target.value)}
						placeholder={searchPlaceholder}
					/>

					<div className={styles.panelActions}>
						<button
							type="button"
							className={styles.linkButton}
							onClick={selectAll}
						>
							Select all
						</button>
						<button
							type="button"
							className={styles.linkButton}
							onClick={clearSelection}
						>
							Clear selection
						</button>
					</div>

					<ul id={listId} className={styles.optionList}>
						{filteredOptions.length === 0 ? (
							<li className={styles.emptyOption}>{emptySearchLabel}</li>
						) : (
							filteredOptions.map((option) => {
								const checkboxId = `${listId}-${option.value}`;
								const checked = selectedValues.includes(option.value);

								return (
									<li key={option.value} className={styles.optionItem}>
										<label className={styles.optionLabel} htmlFor={checkboxId}>
											<input
												id={checkboxId}
												type="checkbox"
												className={styles.checkbox}
												checked={checked}
												onChange={() => toggleValue(option.value)}
											/>
											<span>{option.label}</span>
										</label>
									</li>
								);
							})
						)}
					</ul>
				</div>
			) : null}
		</div>
	);
}
