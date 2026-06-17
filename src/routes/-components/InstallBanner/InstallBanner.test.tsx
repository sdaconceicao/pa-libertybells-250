import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INSTALL_BANNER_DISMISS_KEY } from "./installBanner.utils";
import { InstallBanner } from "./InstallBanner";

function stubMatchMedia(matches = false) {
	vi.stubGlobal(
		"matchMedia",
		vi.fn().mockImplementation((query: string) => ({
			matches,
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	);
}

describe("InstallBanner", () => {
	beforeEach(() => {
		localStorage.clear();
		stubMatchMedia();
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		localStorage.clear();
	});

	it("shows iOS install instructions on iPhone", () => {
		vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
			"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
		);
		vi.spyOn(navigator, "platform", "get").mockReturnValue("iPhone");

		render(<InstallBanner variant="map" />);

		expect(
			screen.getByText("Install PA Bells: tap Share, then Add to Home Screen."),
		).not.toBeNull();
	});

	it("dismisses the banner and persists the choice", () => {
		vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
			"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
		);
		vi.spyOn(navigator, "platform", "get").mockReturnValue("iPhone");

		render(<InstallBanner variant="map" />);

		fireEvent.click(
			screen.getByRole("button", { name: "Dismiss install prompt" }),
		);

		expect(
			screen.queryByText(
				"Install PA Bells: tap Share, then Add to Home Screen.",
			),
		).toBeNull();
		expect(localStorage.getItem(INSTALL_BANNER_DISMISS_KEY)).toBe("1");
	});

	it("shows an install button when beforeinstallprompt fires", async () => {
		vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
			"Mozilla/5.0 (Linux; Android 14)",
		);
		vi.spyOn(navigator, "platform", "get").mockReturnValue("Linux armv8l");

		const prompt = vi.fn().mockResolvedValue(undefined);
		const userChoice = Promise.resolve({ outcome: "accepted" as const });

		render(<InstallBanner variant="map" />);

		act(() => {
			window.dispatchEvent(
				Object.assign(new Event("beforeinstallprompt"), {
					preventDefault: vi.fn(),
					prompt,
					userChoice,
				}),
			);
		});

		expect(
			await screen.findByRole("button", { name: "Install app" }),
		).not.toBeNull();
	});
});
