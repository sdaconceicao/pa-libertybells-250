import type { CSSProperties } from "react";
import { User } from "lucide-react";
import slotStyles from "../IconSlot/IconSlot.module.css";

type Props = {
	size?: number;
};

export function ArtistIcon({ size = 14 }: Props) {
	return (
		<span
			className={slotStyles.iconSlot}
			style={{ "--icon-size": `${size}px` } as CSSProperties}
		>
			<User size={size} aria-hidden="true" />
		</span>
	);
}
