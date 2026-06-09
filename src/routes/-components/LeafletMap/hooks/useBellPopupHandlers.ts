import type {
	LeafletMouseEvent,
	Map as LeafletMapInstance,
	Marker as LeafletMarker,
} from "leaflet";
import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { Bell } from "../../../../lib/bells/types";
import { CLUSTER_DISABLE_ZOOM } from "../components/ClusterMarker/createMarkerClusterGroupOptions";
import { isMovingToElement } from "../utils/isMovingToElement";

type Params = {
	mapRef: RefObject<LeafletMapInstance | null>;
	markerRefs: RefObject<Map<string, LeafletMarker>>;
	setMarkerHighlight: (id: string | null) => void;
	isMobile: boolean;
	sidebarOpen: boolean;
	selectedBellId?: string | null;
	bells: Bell[];
	mapReady: boolean;
};

export function useBellPopupHandlers({
	mapRef,
	markerRefs,
	setMarkerHighlight,
	isMobile,
	sidebarOpen,
	selectedBellId,
	bells,
	mapReady,
}: Params) {
	const enableMapHoverPopup = !isMobile;
	const enableClickMapPopup = !isMobile && !sidebarOpen;
	const enableMapHoverPopupRef = useRef(enableMapHoverPopup);
	enableMapHoverPopupRef.current = enableMapHoverPopup;

	const openHoverPopup = useCallback(
		(bellId: string) => {
			if (!enableMapHoverPopupRef.current) return;
			markerRefs.current.get(bellId)?.openPopup();
		},
		[markerRefs],
	);

	const closeHoverPopup = useCallback(() => {
		if (!enableMapHoverPopupRef.current) return;
		mapRef.current?.closePopup();
	}, [mapRef]);

	const handleMarkerMouseOver = useCallback(
		(bellId: string) => {
			if (!enableMapHoverPopupRef.current) return;
			setMarkerHighlight(bellId);
			openHoverPopup(bellId);
		},
		[setMarkerHighlight, openHoverPopup],
	);

	const handleMarkerMouseOut = useCallback(
		(bellId: string, event: LeafletMouseEvent) => {
			if (!enableMapHoverPopupRef.current) return;
			const popupEl = markerRefs.current.get(bellId)?.getPopup()?.getElement();
			if (isMovingToElement(event.originalEvent.relatedTarget, popupEl)) {
				return;
			}
			closeHoverPopup();
			setMarkerHighlight(null);
		},
		[closeHoverPopup, markerRefs, setMarkerHighlight],
	);

	const handlePopupMouseOut = useCallback(
		(bellId: string, event: LeafletMouseEvent) => {
			if (!enableMapHoverPopupRef.current) return;
			const markerEl = markerRefs.current.get(bellId)?.getElement();
			if (isMovingToElement(event.originalEvent.relatedTarget, markerEl)) {
				return;
			}
			closeHoverPopup();
			setMarkerHighlight(null);
		},
		[closeHoverPopup, markerRefs, setMarkerHighlight],
	);

	useEffect(() => {
		if (!selectedBellId || !mapReady) return;
		const map = mapRef.current;
		if (!map) return;
		const bell = bells.find((b) => b.id === selectedBellId);
		if (!bell) return;

		map.flyTo([bell.lat, bell.lng], CLUSTER_DISABLE_ZOOM);

		const onMoveEnd = () => {
			if (enableClickMapPopup) {
				markerRefs.current.get(selectedBellId)?.openPopup();
			}
		};
		map.once("moveend", onMoveEnd);
		return () => {
			map.off("moveend", onMoveEnd);
		};
	}, [
		selectedBellId,
		bells,
		mapReady,
		enableClickMapPopup,
		mapRef,
		markerRefs,
	]);

	return {
		enableMapHoverPopup,
		handleMarkerMouseOver,
		handleMarkerMouseOut,
		handlePopupMouseOut,
	};
}
