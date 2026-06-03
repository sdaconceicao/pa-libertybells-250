import type { Bell } from "../../../lib/bells/types";
import styles from "./BellContent.module.css";

type Props = {
	bell: Bell;
};

export function BellContent({ bell }: Props) {
	return (
		<article className={styles.entry}>
			<div className={styles.thumbnail}>
				{bell.imageUrl ? (
					<img
						src={bell.imageUrl}
						alt={bell.title}
						className={styles.thumbnailImg}
					/>
				) : (
					<div className={styles.thumbnailPlaceholder} />
				)}
			</div>
			<div className={styles.info}>
				<p className={styles.title}>{bell.title}</p>
				{bell.artist ? <p className={styles.author}>by {bell.artist}</p> : null}
				<p className={styles.address}>{bell.county} County, PA</p>
			</div>
		</article>
	);
}
