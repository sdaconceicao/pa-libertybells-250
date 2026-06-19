import { ChevronDown } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import styles from "./Select.module.css";

export type SelectOption<T extends string> = {
	value: T;
	label: string;
	icon?: ReactNode;
};

type Props<T extends string> = {
	value: T;
	onChange: (value: T) => void;
	options: SelectOption<T>[];
	ariaLabel: string;
	disabled?: boolean;
	placeholderValue?: T;
	className?: string;
};

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
