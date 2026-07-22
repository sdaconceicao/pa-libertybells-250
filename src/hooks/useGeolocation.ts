import { useCallback, useRef, useState } from "react";
import {
	type Coordinates,
	GEOLOCATION_MESSAGES,
	getGeolocationErrorMessage,
} from "../lib/geolocation/geolocation";

export type GeolocationStatus = "idle" | "locating" | "ready" | "error";

export type UseGeolocation = {
	/** The user's coordinates once a fix succeeds, otherwise `null`. */
	coords: Coordinates | null;
	status: GeolocationStatus;
	/** A user-facing message when `status` is `"error"`, otherwise `null`. */
	error: string | null;
	/** Ask the browser for the user's position. A no-op while one is pending. */
	request: () => void;
};

const GEOLOCATION_OPTIONS: PositionOptions = {
	enableHighAccuracy: true,
	timeout: 10000,
	maximumAge: 60000,
};

/**
 * Lazily resolves the user's location on demand. The browser prompt only fires
 * when `request()` is called, so nothing happens until a feature actually needs
 * the position (e.g. the distance filter).
 */
export function useGeolocation(): UseGeolocation {
	const [coords, setCoords] = useState<Coordinates | null>(null);
	const [status, setStatus] = useState<GeolocationStatus>("idle");
	const [error, setError] = useState<string | null>(null);

	// Guards against overlapping requests while a fix is in flight.
	const pendingRef = useRef(false);

	const request = useCallback(() => {
		if (pendingRef.current) {
			return;
		}

		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setStatus("error");
			setError(GEOLOCATION_MESSAGES.unsupported);
			return;
		}

		pendingRef.current = true;
		setStatus("locating");
		setError(null);

		navigator.geolocation.getCurrentPosition(
			(position) => {
				pendingRef.current = false;
				setCoords({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
				setStatus("ready");
			},
			(positionError) => {
				pendingRef.current = false;
				setStatus("error");
				setError(getGeolocationErrorMessage(positionError));
			},
			GEOLOCATION_OPTIONS,
		);
	}, []);

	return { coords, status, error, request };
}
