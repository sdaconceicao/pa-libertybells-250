import type { Bell } from "../../../lib/bells/types";
import styles from "./BellContent.module.css";

type Props = {
	bell: Bell;
	onHover?: (bellId: string | null) => void;
	onSelect?: (bellId: string) => void;
};

export function BellContent({ bell, onHover, onSelect }: Props) {
	return (
		<button
			type="button"
			className={styles.entry}
			onMouseEnter={() => onHover?.(bell.id)}
			onMouseLeave={() => onHover?.(null)}
			onClick={() => onSelect?.(bell.id)}
		>
			<div className={styles.thumbnail}>
				{bell.imageUrl ? (
					<img
						src={bell.imageUrl}
						alt={bell.title}
						className={styles.thumbnailImg}
						loading="lazy"
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
		</button>
	);
}
