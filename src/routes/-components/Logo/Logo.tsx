import circleLogo from "./circle.svg?url";
import wideLogo from "./wide.svg?url";
import styles from "./Logo.module.css";

type Props = {
	variant: "wide" | "circle";
	className?: string;
	alt?: string;
};

const logoSources = {
	wide: wideLogo,
	circle: circleLogo,
} as const;

export function Logo({ variant, className, alt = "Bells Across PA" }: Props) {
	const logoClassName = [
		styles.logo,
		variant === "wide" ? styles.wide : styles.circle,
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<img
			src={logoSources[variant]}
			alt={alt}
			className={logoClassName}
			data-testid={`logo-${variant}`}
		/>
	);
}
