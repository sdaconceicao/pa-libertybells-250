import { ClientOnly } from "@tanstack/react-router";
import type { RefObject } from "react";
import type { Bell } from "../../../lib/bells/types";
import { MapLoading } from "../MapLoading/MapLoading";
import { LeafletMap } from "../LeafletMap/LeafletMap";

type Props = {
	bells: Bell[];
	sidebarOpen: boolean;
	isMobile: boolean;
	highlightRef: RefObject<((id: string | null) => void) | null>;
	selectedBellId?: string | null;
};

export function BellsMap({ bells, sidebarOpen, isMobile, highlightRef, selectedBellId }: Props) {
	return (
		<ClientOnly fallback={<MapLoading />}>
			<LeafletMap
				bells={bells}
				sidebarOpen={sidebarOpen}
				isMobile={isMobile}
				highlightRef={highlightRef}
				selectedBellId={selectedBellId}
			/>
		</ClientOnly>
	);
}
