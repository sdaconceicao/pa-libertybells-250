import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "tertiary";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	fullWidth?: boolean;
	children: ReactNode;
};

export function Button({
	variant = "primary",
	fullWidth = false,
	className,
	type = "button",
	children,
	...rest
}: Props) {
	const buttonClassName = [
		styles.button,
		styles[variant],
		fullWidth ? styles.fullWidth : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button type={type} className={buttonClassName} {...rest}>
			{children}
		</button>
	);
}
