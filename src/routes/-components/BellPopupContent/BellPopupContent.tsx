import { formatCountyName } from "../../../lib/bells/formatCountyName";
import type { Bell } from "../../../lib/bells/types";
import styles from "./BellPopupContent.module.css";

type Props = {
	bell: Bell;
};

export function BellPopupContent({ bell }: Props) {
	return (
		<div className={styles.popup}>
			<h3 className={styles.popupTitle}>
				{bell.title}{" "}
				<span className={styles.popupCounty}>
					({formatCountyName(bell.county)} County)
				</span>
			</h3>
			{bell.artist ? (
				<p className={styles.popupMeta}>Artist: {bell.artist}</p>
			) : null}
			<p className={styles.popupMeta}>
				Current location: {bell.currentAddress}
			</p>
			{bell.localityLabel ? (
				<p className={styles.popupLocality}>Locality: {bell.localityLabel}</p>
			) : null}
			{bell.geocodeQuality === "approximate" ? (
				<p className={styles.popupWarning}>
					Approximate map location ({bell.geocodeSource})
				</p>
			) : null}
			{bell.imageUrl ? (
				<img
					src={bell.imageUrl}
					alt={bell.title}
					className={styles.popupImage}
				/>
			) : null}
		</div>
	);
}
