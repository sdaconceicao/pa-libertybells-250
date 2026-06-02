import styles from "./SegmentedControl.module.css";

export type SegmentedOption<T extends string = string> = {
	value: T;
	label: string;
};

type Props<T extends string> = {
	options: SegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
	ariaLabel: string;
	helperText?: string | null;
};

export function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	ariaLabel,
	helperText,
}: Props<T>) {
	return (
		<div className={styles.root}>
			<div className={styles.bar} role="tablist" aria-label={ariaLabel}>
				{options.map((option) => (
					<button
						key={option.value}
						type="button"
						role="tab"
						className={[
							styles.button,
							value === option.value ? styles.buttonActive : "",
						]
							.filter(Boolean)
							.join(" ")}
						aria-selected={value === option.value}
						onClick={() => onChange(option.value)}
					>
						{option.label}
					</button>
				))}
			</div>
			{helperText ? <p className={styles.helper}>{helperText}</p> : null}
		</div>
	);
}
