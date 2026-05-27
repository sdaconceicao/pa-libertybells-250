const BELLS_URL = "https://www.america250pa.org/PPE:_Bells_Across_PA";

export async function fetchBellsPageHtml(): Promise<string> {
	const res = await fetch(BELLS_URL, {
		method: "GET",
		headers: {
			"User-Agent": "bells-across-pa-map/1.0 (+contact@example.com)",
			Accept: "text/html,application/xhtml+xml",
		},
	});

	if (!res.ok) {
		throw new Error(
			`Failed to fetch Bells Across PA page: ${res.status} ${res.statusText}`,
		);
	}

	return await res.text();
}
