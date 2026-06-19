import { type ReactNode, useId } from "react";
import styles from "./Checkbox.module.css";

type Props = {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: ReactNode;
	disabled?: boolean;
	id?: string;
};

export function Checkbox({ checked, onChange, label, disabled, id }: Props) {
	const generatedId = useId();
	const inputId = id ?? generatedId;

	return (
		<label className={styles.checkbox} htmlFor={inputId}>
			<input
				id={inputId}
				type="checkbox"
				className={styles.input}
				checked={checked}
				disabled={disabled}
				onChange={(event) => onChange(event.target.checked)}
			/>
			<span className={styles.label}>{label}</span>
		</label>
	);
}
