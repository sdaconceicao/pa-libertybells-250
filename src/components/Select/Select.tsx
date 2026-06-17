import { ChevronDown } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import styles from "./Select.module.css";

export type SelectOption<T extends string> = {
	value: T;
	label: string;
	/**
	 * Optional icon shown on the trigger when this option is selected. Native
	 * <option> elements can't render SVGs, so icons only appear on the trigger,
	 * not in the open list.
	 */
	icon?: ReactNode;
};

type Props<T extends string> = {
	value: T;
	onChange: (value: T) => void;
	options: SelectOption<T>[];
	ariaLabel: string;
	disabled?: boolean;
	/**
	 * When this value is selected the trigger renders in a muted "placeholder"
	 * style, so an option can double as a placeholder/cleared state.
	 */
	placeholderValue?: T;
	/** Extra class applied to the native <select> for sizing/visual overrides. */
	className?: string;
};

/**
 * Generic styled dropdown: a native <select> with a chevron affordance. Keeping
 * it native preserves accessibility and avoids clipping issues inside scrolling
 * or overflow-hidden containers.
 */
export function Select<T extends string>({
	value,
	onChange,
	options,
	ariaLabel,
	disabled,
	placeholderValue,
	className,
}: Props<T>) {
	function handleChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange(event.target.value as T);
	}

	const isPlaceholder = placeholderValue != null && value === placeholderValue;
	const selectedIcon = options.find((option) => option.value === value)?.icon;

	return (
		<div className={styles.wrap}>
			{selectedIcon ? (
				<span className={styles.icon} aria-hidden="true">
					{selectedIcon}
				</span>
			) : null}
			<select
				className={[
					styles.select,
					selectedIcon ? styles.hasIcon : "",
					isPlaceholder ? styles.placeholder : "",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				value={value}
				disabled={disabled}
				aria-label={ariaLabel}
				onChange={handleChange}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<ChevronDown
				className={styles.chevron}
				size={14}
				strokeWidth={2}
				aria-hidden="true"
			/>
		</div>
	);
}
