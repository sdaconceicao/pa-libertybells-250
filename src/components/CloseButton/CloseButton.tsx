import { X } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import styles from "./CloseButton.module.css";

export type CloseButtonVariant = "default" | "overlay";

type Props = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	"type" | "children"
> & {
	label?: string;
	iconSize?: number;
	variant?: CloseButtonVariant;
};

export function CloseButton({
	label = "Close",
	iconSize = 16,
	variant = "default",
	className,
	...rest
}: Props) {
	const buttonClassName = [
		styles.closeButton,
		variant === "overlay" ? styles.overlay : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button
			type="button"
			className={buttonClassName}
			aria-label={label}
			{...rest}
		>
			<X size={iconSize} aria-hidden="true" />
		</button>
	);
}
