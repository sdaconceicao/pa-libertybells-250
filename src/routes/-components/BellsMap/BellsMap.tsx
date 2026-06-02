import { ClientOnly } from "@tanstack/react-router";
import type { Bell } from "../../../lib/bells/types";
import { MapLoading } from "../MapLoading/MapLoading";
import { LeafletMap } from "../LeafletMap/LeafletMap";

type Props = {
	bells: Bell[];
	sidebarOpen: boolean;
	isMobile: boolean;
};

export function BellsMap({ bells, sidebarOpen, isMobile }: Props) {
	return (
		<ClientOnly fallback={<MapLoading />}>
			<LeafletMap bells={bells} sidebarOpen={sidebarOpen} isMobile={isMobile} />
		</ClientOnly>
	);
}
