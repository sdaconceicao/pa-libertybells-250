import { Building2, MapPin, Trees } from "lucide-react";
import type { CSSProperties } from "react";
import type { BellPlacement } from "../../../lib/bells/types";
import slotStyles from "../IconSlot/IconSlot.module.css";

type Props = {
	size?: number;
	placement?: BellPlacement;
};

/**
 * Leading icon for a bell's address. Reflects placement when known — an indoor
 * (building) or outdoor (trees) icon — and otherwise falls back to the map
 * marker.
 */
export function AddressIcon({ size = 14, placement }: Props) {
	const className = `${slotStyles.iconSlot} ${slotStyles.iconSlotTopRight}`;
	const style = { "--icon-size": `${size}px` } as CSSProperties;

	if (placement === "indoors") {
		return (
			<span className={className} style={style} role="img" aria-label="Indoor">
				<Building2 size={size} aria-hidden="true" />
			</span>
		);
	}

	if (placement === "outdoors") {
		return (
			<span className={className} style={style} role="img" aria-label="Outdoor">
				<Trees size={size} aria-hidden="true" />
			</span>
		);
	}

	return (
		<span className={className} style={style}>
			<MapPin size={size} aria-hidden="true" />
		</span>
	);
}
