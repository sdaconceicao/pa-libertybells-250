/** Pennsylvania bounding box: min lng, min lat, max lng, max lat */
const PA_BOUNDS = "-80.5191,39.7198,-74.6895,42.2699";

export type OpenCageGeocodeResult = {
	lat: number;
	lng: number;
	localityLabel?: string;
};

type OpenCageResponse = {
	results?: Array<{
		geometry: { lat: number; lng: number };
		components?: {
			_normalized_city?: string;
			city?: string;
			town?: string;
			village?: string;
			state_code?: string;
			_type?: string;
		};
	}>;
	status?: { code?: number; message?: string };
};

const COARSE_TYPES = new Set([
	"state",
	"country",
	"continent",
	"region",
	"postcode",
]);

export async function geocodeWithOpenCage(
	query: string,
	apiKey: string,
): Promise<OpenCageGeocodeResult | null> {
	const url = new URL("https://api.opencagedata.com/geocode/v1/json");
	url.searchParams.set("q", query);
	url.searchParams.set("key", apiKey);
	url.searchParams.set("countrycode", "us");
	url.searchParams.set("limit", "1");
	url.searchParams.set("bounds", PA_BOUNDS);
	url.searchParams.set("no_annotations", "1");

	const res = await fetch(url.toString());
	if (!res.ok) {
		console.warn("OpenCage geocoding failed", res.status, res.statusText);
		return null;
	}

	const data = (await res.json()) as OpenCageResponse;
	const first = data.results?.[0];
	if (!first) return null;

	const type = first.components?._type;
	if (type && COARSE_TYPES.has(type)) return null;

	const { lat, lng } = first.geometry;
	if (lat < 39.5 || lat > 42.5 || lng < -81 || lng > -74) return null;

	const city =
		first.components?._normalized_city ??
		first.components?.city ??
		first.components?.town ??
		first.components?.village;

	return {
		lat,
		lng,
		localityLabel: city ? `${city}, PA` : undefined,
	};
}
