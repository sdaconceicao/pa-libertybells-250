/**
 * Human-readable messages for the geolocation failures we surface to users.
 * Kept in one place so the control and its tests stay in sync.
 */
export const GEOLOCATION_MESSAGES = {
	unsupported:
		"Your browser doesn't support location services, so we can't center the map on you.",
	denied:
		"Location access is blocked. Enable location permissions for this site in your browser settings, then try again.",
	unavailable:
		"We couldn't determine your location right now. Please try again.",
	timeout: "Finding your location took too long. Please try again.",
	generic: "We couldn't access your location. Please try again.",
} as const;

/** Map a `GeolocationPositionError` code to one of our user-facing messages. */
export function getGeolocationErrorMessage(
	error: Pick<GeolocationPositionError, "code">,
): string {
	switch (error.code) {
		case 1: // PERMISSION_DENIED
			return GEOLOCATION_MESSAGES.denied;
		case 2: // POSITION_UNAVAILABLE
			return GEOLOCATION_MESSAGES.unavailable;
		case 3: // TIMEOUT
			return GEOLOCATION_MESSAGES.timeout;
		default:
			return GEOLOCATION_MESSAGES.generic;
	}
}
