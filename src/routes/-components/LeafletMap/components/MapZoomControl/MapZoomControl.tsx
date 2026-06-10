import type { Control } from "leaflet";
import { DomEvent, DomUtil, Control as LeafletControl } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import {
	getMapViewportPadding,
	getVisibleCenterContainerPoint,
} from "../../utils/mapViewportPadding";

type Props = {
	sidebarOpen: boolean;
	isMobile: boolean;
};

function getViewportPadding(sidebarOpen: boolean, isMobile: boolean) {
	const rootFontSize =
		Number.parseFloat(getComputedStyle(document.documentElement).fontSize) ||
		16;

	return getMapViewportPadding({
		sidebarOpen,
		isMobile,
		viewportWidth: window.innerWidth,
		rootFontSize,
	});
}

export function MapZoomControl({ sidebarOpen, isMobile }: Props) {
	const map = useMap();

	useEffect(() => {
		const PaddedZoomControl = LeafletControl.extend({
			options: {
				position: "bottomright",
			},
			onAdd() {
				const container = DomUtil.create(
					"div",
					"leaflet-control-zoom leaflet-bar",
				);
				const zoomIn = DomUtil.create(
					"a",
					"leaflet-control-zoom-in",
					container,
				) as HTMLAnchorElement;
				zoomIn.href = "#";
				zoomIn.title = "Zoom in";
				zoomIn.setAttribute("role", "button");
				zoomIn.setAttribute("aria-label", "Zoom in");
				zoomIn.innerHTML = "+";

				const zoomOut = DomUtil.create(
					"a",
					"leaflet-control-zoom-out",
					container,
				) as HTMLAnchorElement;
				zoomOut.href = "#";
				zoomOut.title = "Zoom out";
				zoomOut.setAttribute("role", "button");
				zoomOut.setAttribute("aria-label", "Zoom out");
				zoomOut.innerHTML = "−";

				const zoomAroundVisibleCenter = (delta: number) => {
					const padding = getViewportPadding(sidebarOpen, isMobile);
					const mapSize = map.getSize();
					const [x, y] = getVisibleCenterContainerPoint(padding, mapSize);
					const latLng = map.containerPointToLatLng([x, y]);
					map.setZoomAround(latLng, map.getZoom() + delta);
				};

				DomEvent.on(zoomIn, "click", DomEvent.stop)
					.on(zoomIn, "click", () => {
						zoomAroundVisibleCenter(1);
					})
					.on(zoomOut, "click", DomEvent.stop)
					.on(zoomOut, "click", () => {
						zoomAroundVisibleCenter(-1);
					})
					.on(zoomIn, "dblclick", DomEvent.stop)
					.on(zoomOut, "dblclick", DomEvent.stop);

				return container;
			},
		});

		const control = new PaddedZoomControl() as Control;
		control.addTo(map);

		return () => {
			control.remove();
		};
	}, [map, sidebarOpen, isMobile]);

	return null;
}
