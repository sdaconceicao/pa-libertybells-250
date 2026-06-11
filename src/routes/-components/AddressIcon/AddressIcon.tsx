import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";
import slotStyles from "../IconSlot/IconSlot.module.css";

type Props = {
	size?: number;
};

export function AddressIcon({ size = 14 }: Props) {
	return (
		<span
			className={`${slotStyles.iconSlot} ${slotStyles.iconSlotTopRight}`}
			style={{ "--icon-size": `${size}px` } as CSSProperties}
		>
			<MapPin size={size} aria-hidden="true" />
		</span>
	);
}
