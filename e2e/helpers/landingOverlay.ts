import type { Page } from "@playwright/test";
import { LANDING_OVERLAY_DISMISS_KEY } from "../../src/routes/-components/LandingOverlay/LandingOverlay.utils";

/**
 * Persist the first-visit landing dismiss flag before navigation so the
 * panel never covers map chrome (locate, location warning, etc.).
 */
export async function skipLandingOverlay(page: Page) {
	await page.addInitScript((key: string) => {
		sessionStorage.setItem(key, "1");
	}, LANDING_OVERLAY_DISMISS_KEY);
}
