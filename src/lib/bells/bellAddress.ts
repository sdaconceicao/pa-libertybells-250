import { parseBellAddress } from "./parseAddress";
import type { BellAddress } from "./types";

export const addressFromRaw = (raw: string): BellAddress => {
	const parsed = parseBellAddress(raw);
	return {
		venueName: parsed.venueName,
		street: parsed.street,
		city: parsed.city,
		zip: parsed.zip,
	};
};

export const buildLocalityLabel = (
	address: BellAddress,
): string | undefined => {
	return address.city ? `${address.city}, PA` : undefined;
};

export const buildGeocodeQuery = (address: BellAddress): string => {
	const { street, city, zip } = address;

	if (street && city && zip) {
		return `${street}, ${city}, PA ${zip}`;
	}
	if (street && city) {
		return `${street}, ${city}, PA`;
	}
	if (street && zip) {
		return `${street}, PA ${zip}`;
	}
	if (street) {
		return `${street}, PA`;
	}
	if (city && zip) {
		return `${city}, PA ${zip}`;
	}
	if (city) {
		return `${city}, PA`;
	}

	return "PA";
};

export const buildAddressLines = (address: BellAddress): string[] => {
	const lines: string[] = [];

	if (address.venueName) {
		lines.push(address.venueName);
	}
	if (address.street) {
		lines.push(address.street);
	}
	if (address.city) {
		const cityLine = address.zip
			? `${address.city}, PA ${address.zip}`
			: `${address.city}, PA`;
		lines.push(cityLine);
	}

	return lines;
};

export const buildAddressString = (address: BellAddress): string => {
	return buildAddressLines(address).join(", ");
};

export const buildMapsUrl = (
	lat: number,
	lng: number,
	address?: BellAddress,
): string => {
	const query = address
		? encodeURIComponent(buildGeocodeQuery(address))
		: `${lat},${lng}`;

	return `https://www.google.com/maps/search/?api=1&query=${query}`;
};
