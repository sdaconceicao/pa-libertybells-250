/** Pennsylvania bounding box for map framing and geocoding. */
export const PA_MAP_SOUTH = 39.7198;
export const PA_MAP_WEST = -80.5191;
export const PA_MAP_NORTH = 42.2699;
export const PA_MAP_EAST = -74.6895;

/** Leaflet bounds corners: south-west then north-east, each as [lat, lng]. */
export const PA_MAP_BOUNDS: [[number, number], [number, number]] = [
	[PA_MAP_SOUTH, PA_MAP_WEST],
	[PA_MAP_NORTH, PA_MAP_EAST],
];

export const PA_MAP_CENTER: [number, number] = [
	(PA_MAP_SOUTH + PA_MAP_NORTH) / 2,
	(PA_MAP_WEST + PA_MAP_EAST) / 2,
];
