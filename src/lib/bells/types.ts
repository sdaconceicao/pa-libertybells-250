export type BellPlacement = "indoors" | "outdoors";

export type BellAddress = {
	venueName?: string;
	street?: string;
	city?: string;
	zip?: string;
};

export type RawBell = {
	id: string;
	county: string;
	title: string;
	artist?: string;
	address: BellAddress;
	unveilingAddress?: BellAddress;
	imageUrl?: string;
	/** Parsed from page footnotes; undefined when missing or unrecognized */
	placement?: BellPlacement;
	sponsor?: string;
	sourceSlug: string;
};

export type GeocodeQuality = "exact" | "approximate";

export type GeocodeSource =
	| "opencage"
	| "census"
	| "nominatim"
	| "override"
	| "county_centroid";

export type GeocodedBell = RawBell & {
	lat: number;
	lng: number;
	/** City/locality derived at sync time (e.g. "Philadelphia, PA") */
	localityLabel?: string;
	geocodeQuality?: GeocodeQuality;
	geocodeSource?: GeocodeSource;
};

export type Bell = GeocodedBell;
