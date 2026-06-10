import type { Marker as LeafletMarker } from "leaflet";
import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import markerStyles from "../components/Marker/Marker.module.css";

export function useBellMarkerHandlers(
	highlightRef: RefObject<((id: string | null) => void) | null>,
) {
	const markerRefs = useRef<Map<string, LeafletMarker>>(new Map());

	const setMarkerHighlight = useCallback((id: string | null) => {
		markerRefs.current.forEach((marker) => {
			marker.getElement()?.classList.remove(markerStyles.bellMarkerHighlighted);
		});
		if (id) {
			markerRefs.current
				.get(id)
				?.getElement()
				?.classList.add(markerStyles.bellMarkerHighlighted);
		}
	}, []);

	const registerMarkerRef = useCallback(
		(bellId: string, instance: LeafletMarker | null) => {
			if (instance) {
				markerRefs.current.set(bellId, instance);
				return;
			}
			markerRefs.current.delete(bellId);
		},
		[],
	);

	useEffect(() => {
		highlightRef.current = setMarkerHighlight;
		return () => {
			highlightRef.current = null;
		};
	}, [highlightRef, setMarkerHighlight]);

	return {
		markerRefs,
		setMarkerHighlight,
		registerMarkerRef,
	};
}
