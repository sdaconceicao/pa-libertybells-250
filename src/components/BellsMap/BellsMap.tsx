import { ClientOnly } from "@tanstack/react-router";
import type { Bell } from "../../lib/bells/types";
import { LeafletMap } from "../LeafletMap/LeafletMap";
import { MapLoading } from "../MapLoading/MapLoading";

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
