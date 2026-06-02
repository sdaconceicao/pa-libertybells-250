/** Display label for a PA county name stored in bell data (often ALL CAPS). */
export function formatCountyName(county: string): string {
	const trimmed = county.trim();
	if (!trimmed) {
		return trimmed;
	}
	return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}
