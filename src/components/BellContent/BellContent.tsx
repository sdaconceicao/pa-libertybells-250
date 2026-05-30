import type { Bell } from "../../lib/bells/types";
import styles from "./BellContent.module.css";

type Props = {
	bell: Bell;
};

export function BellContent({ bell }: Props) {
	return (
		<article className={styles.entry}>
			<h2 className={styles.entryTitle}>{bell.title}</h2>
			<p className={styles.entryMeta}>{bell.county} County</p>
			{bell.artist ? (
				<p className={styles.entryDetail}>Artist: {bell.artist}</p>
			) : null}
			<p className={styles.entryDetail}>
				Current location: {bell.currentAddress}
			</p>
		</article>
	);
}
