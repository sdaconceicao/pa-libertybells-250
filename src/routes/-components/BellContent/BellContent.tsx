import { Image } from "../../../components/Image/Image";
import { getBellThumbUrl } from "../../../lib/bells/bellImageVariants";
import type { Bell } from "../../../lib/bells/types";
import styles from "./BellContent.module.css";

type Props = {
	bell: Bell;
	isActive?: boolean;
	onHover?: (bellId: string | null) => void;
	onSelect?: (bellId: string) => void;
	optionId?: string;
	ariaSelected?: boolean;
	onOptionMouseEnter?: () => void;
};

/**
 * The thumbnail + title/artist/county row, without any interaction wrapper.
 * Exported so consumers that own their own option semantics (e.g. the search
 * dropdown, whose listbox items come from Lago) can reuse the presentation.
 */
export function BellContentBody({ bell }: { bell: Bell }) {
	return (
		<>
			<div className={styles.thumbnail}>
				<Image
					src={getBellThumbUrl(bell.imageUrl)}
					alt={bell.title}
					imageClassName={styles.thumbnailImg}
					placeholderClassName={styles.thumbnailPlaceholder}
					loading="lazy"
					decoding="async"
				/>
			</div>
			<div className={styles.info}>
				<p className={styles.title}>{bell.title}</p>
				{bell.artist ? <p className={styles.author}>by {bell.artist}</p> : null}
				<p className={styles.address}>{bell.county} County, PA</p>
			</div>
		</>
	);
}

export function BellContent({
	bell,
	isActive = false,
	onHover,
	onSelect,
	optionId,
	ariaSelected = false,
	onOptionMouseEnter,
}: Props) {
	const entryClassName = [styles.entry, isActive ? styles.entryActive : ""]
		.filter(Boolean)
		.join(" ");

	if (optionId) {
		return (
			<div
				id={optionId}
				role="option"
				tabIndex={-1}
				className={entryClassName}
				aria-selected={ariaSelected}
				onMouseEnter={() => {
					onOptionMouseEnter?.();
					onHover?.(bell.id);
				}}
				onMouseLeave={() => onHover?.(null)}
				onClick={() => onSelect?.(bell.id)}
				onKeyDown={(event) => {
					if (event.key !== "Enter" && event.key !== " ") {
						return;
					}
					event.preventDefault();
					onSelect?.(bell.id);
				}}
			>
				<BellContentBody bell={bell} />
			</div>
		);
	}

	return (
		<button
			type="button"
			className={entryClassName}
			onMouseEnter={() => onHover?.(bell.id)}
			onMouseLeave={() => onHover?.(null)}
			onClick={() => onSelect?.(bell.id)}
		>
			<BellContentBody bell={bell} />
		</button>
	);
}
