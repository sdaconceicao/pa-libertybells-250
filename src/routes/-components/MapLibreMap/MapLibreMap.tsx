import { LocateFixed, LoaderCircle, Minus, Plus } from "lucide-react";
import { createPortal } from "react-dom";
import { BellVisitStatus } from "../BellVisitStatus/BellVisitStatus";
import { BellPopupContent } from "../BellPopupContent/BellPopupContent";
import { MapLoading } from "../MapLoading/MapLoading";
import { MapLocationWarning } from "./components/MapLocationWarning/MapLocationWarning";
import {
	useMapLibreMap,
	type UseMapLibreMapOptions,
} from "./hooks/useMapLibreMap";
import styles from "./MapLibreMap.module.css";

export function MapLibreMap(options: UseMapLibreMapOptions) {
	const {
		shellRef,
		canvasRef,
		mapReady,
		popupNode,
		popupBell,
		locationWarning,
		locating,
		atZoomOutLimit,
		zoom,
		locate,
		handlePopupMouseLeave,
		dismissLocationWarning,
	} = useMapLibreMap(options);

	return (
		<div ref={shellRef} className={styles.mapShell}>
			<div ref={canvasRef} className={styles.mapCanvas} />
			{!mapReady && <MapLoading />}
			{mapReady && (
				<div className={styles.controls}>
					<button
						type="button"
						title="Center on my location"
						aria-label="Center on my location"
						aria-busy={locating}
						onClick={locate}
					>
						{locating ? (
							<LoaderCircle className={styles.spinner} />
						) : (
							<LocateFixed />
						)}
					</button>
					<div className={styles.zoomControls}>
						<button
							type="button"
							title="Zoom in"
							aria-label="Zoom in"
							onClick={() => zoom(1)}
						>
							<Plus />
						</button>
						<button
							type="button"
							title="Zoom out"
							aria-label="Zoom out"
							disabled={atZoomOutLimit}
							onClick={() => zoom(-1)}
						>
							<Minus />
						</button>
					</div>
				</div>
			)}
			{popupNode &&
				popupBell &&
				createPortal(
					// biome-ignore lint/a11y/noStaticElementInteractions: Mouse leave keeps the popup open when moving back to its marker.
					<div
						onMouseLeave={(event) => handlePopupMouseLeave(event.relatedTarget)}
					>
						<BellPopupContent
							key={popupBell.id}
							bell={popupBell}
							actions={<BellVisitStatus bellId={popupBell.id} />}
						/>
					</div>,
					popupNode,
				)}
			<MapLocationWarning
				message={locationWarning}
				onDismiss={dismissLocationWarning}
			/>
		</div>
	);
}
