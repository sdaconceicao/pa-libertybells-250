import type { ReactNode } from "react";
import styles from "./MetaBar.module.css";

type Props = {
	/** Navigation controls, stretched across the bar. */
	nav?: ReactNode;
};

export function MetaBar({ nav }: Props) {
	if (!nav) {
		return null;
	}

	return <div className={styles.metaBar}>{nav}</div>;
}
