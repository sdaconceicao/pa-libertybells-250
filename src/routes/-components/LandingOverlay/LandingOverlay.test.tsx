import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bell } from "../../../lib/bells/types";
import { LandingOverlay } from "./LandingOverlay";
import { LANDING_OVERLAY_DISMISS_KEY } from "./LandingOverlay.utils";
import {
	LandingOverlayProvider,
	useLandingOverlayState,
} from "./useLandingOverlay";

const { authState, authModalState, openAuthModal } = vi.hoisted(() => ({
	authState: {
		isAuthed: false,
		user: null as { id: string } | null,
		isPending: false,
	},
	authModalState: {
		isOpen: false,
	},
	openAuthModal: vi.fn(),
}));

vi.mock("../../../lib/auth/authClient", () => ({
	useAuth: () => authState,
}));

vi.mock("../AuthModal/AuthModalContext", () => ({
	useAuthModal: () => ({
		isOpen: authModalState.isOpen,
		openAuthModal,
		closeAuthModal: vi.fn(),
	}),
}));

function makeBell(
	overrides: Partial<Bell> & Pick<Bell, "id" | "county" | "title">,
): Bell {
	return {
		address: { city: "York", zip: "17401" },
		sourceSlug: overrides.id,
		lat: 40,
		lng: -77,
		...overrides,
	};
}

const featuredBells: Bell[] = [
	makeBell({
		id: "washington-the-american-spirit",
		county: "Washington",
		title: "The American Spirit",
		artist: "James Sulkowski",
	}),
	makeBell({
		id: "butler-the-butler-bell",
		county: "Butler",
		title: "The Butler Bell",
		artist: "Tom Panei",
	}),
	makeBell({
		id: "allegheny-pittsburgh-s-250-bell",
		county: "Allegheny",
		title: "Pittsburgh's 250 Bell",
		artist: "Scott Saloney",
	}),
];

function renderOverlay(
	ui: ReactElement = (
		<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />
	),
) {
	return render(<LandingOverlayProvider>{ui}</LandingOverlayProvider>);
}

describe("LandingOverlay", () => {
	beforeEach(() => {
		sessionStorage.clear();
		authState.isAuthed = false;
		authState.user = null;
		authState.isPending = false;
		authModalState.isOpen = false;
		openAuthModal.mockClear();
	});

	afterEach(() => {
		cleanup();
		sessionStorage.clear();
	});

	it("renders the heading and circle logo", () => {
		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Discover Pennsylvania’s Liberty Bells",
			}),
		).toBeTruthy();
		expect(screen.getByTestId("logo-circle")).toBeTruthy();
		expect(screen.getByText("by James Sulkowski")).toBeTruthy();
		expect(screen.getByText("by Tom Panei")).toBeTruthy();
		expect(screen.getByText("by Scott Saloney")).toBeTruthy();
		const overlay = screen.getByTestId("landing-overlay");
		expect(overlay.tagName).toBe("SECTION");
		expect(overlay.getAttribute("aria-modal")).toBeNull();
		expect(overlay.className).toMatch(/panelSidebarClosed/);
	});

	it("does not render when already dismissed this session", () => {
		sessionStorage.setItem(LANDING_OVERLAY_DISMISS_KEY, "1");

		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		expect(screen.queryByTestId("landing-overlay")).toBeNull();
	});

	it("does not render when the user is already signed in", () => {
		authState.isAuthed = true;
		authState.user = { id: "user-1" };

		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		expect(screen.queryByTestId("landing-overlay")).toBeNull();
	});

	it("does not render while auth is pending", () => {
		authState.isPending = true;

		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		expect(screen.queryByTestId("landing-overlay")).toBeNull();
	});

	it("dismisses on Explore the Bells and persists the choice", () => {
		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		fireEvent.click(screen.getByRole("button", { name: "Explore the Bells" }));

		expect(screen.queryByTestId("landing-overlay")).toBeNull();
		expect(sessionStorage.getItem(LANDING_OVERLAY_DISMISS_KEY)).toBe("1");
	});

	it("dismisses on View All Bells", () => {
		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		fireEvent.click(screen.getByRole("button", { name: "View All Bells" }));

		expect(screen.queryByTestId("landing-overlay")).toBeNull();
	});

	it("dismisses on Escape", () => {
		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		fireEvent.keyDown(document, { key: "Escape" });

		expect(screen.queryByTestId("landing-overlay")).toBeNull();
	});

	it("ignores other keyboard keys", () => {
		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		fireEvent.keyDown(document, { key: "Enter" });

		expect(screen.getByTestId("landing-overlay")).toBeTruthy();
	});

	it("does not dismiss on Escape while the auth modal is open", () => {
		authModalState.isOpen = true;

		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		fireEvent.keyDown(document, { key: "Escape" });

		expect(screen.getByTestId("landing-overlay")).toBeTruthy();
	});

	it("dismisses from the close button", () => {
		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		expect(screen.queryByTestId("landing-overlay")).toBeNull();
	});

	it("sits beside the open sidebar", () => {
		renderOverlay(
			<LandingOverlay
				bells={featuredBells}
				onBellSelect={vi.fn()}
				sidebarOpen
			/>,
		);

		expect(screen.getByTestId("landing-overlay").className).toMatch(
			/panelBesideSidebar/,
		);
	});

	it("opens the auth modal on the register tab", () => {
		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />,
		);

		fireEvent.click(screen.getByRole("button", { name: "Create an Account" }));

		expect(openAuthModal).toHaveBeenCalledWith("register");
		expect(screen.getByTestId("landing-overlay")).toBeTruthy();
	});

	it("selects a featured bell and dismisses", () => {
		const onBellSelect = vi.fn();

		renderOverlay(
			<LandingOverlay bells={featuredBells} onBellSelect={onBellSelect} />,
		);

		fireEvent.click(screen.getByRole("button", { name: /The Butler Bell/ }));

		expect(onBellSelect).toHaveBeenCalledWith("butler-the-butler-bell");
		expect(screen.queryByTestId("landing-overlay")).toBeNull();
	});

	it("hides featured bells when none of the ids are present", () => {
		renderOverlay(
			<LandingOverlay
				bells={[
					makeBell({
						id: "other",
						county: "York",
						title: "Other Bell",
					}),
				]}
				onBellSelect={vi.fn()}
			/>,
		);

		expect(screen.queryByText("Featured Bells")).toBeNull();
	});

	it("dismisses when a sibling in the same provider asks to", () => {
		function SidebarStandIn() {
			const { dismiss } = useLandingOverlayState();
			return (
				<button type="button" onPointerDown={dismiss}>
					Pick a bell
				</button>
			);
		}

		renderOverlay(
			<>
				<SidebarStandIn />
				<LandingOverlay bells={featuredBells} onBellSelect={vi.fn()} />
			</>,
		);

		fireEvent.pointerDown(screen.getByRole("button", { name: "Pick a bell" }));

		expect(screen.queryByTestId("landing-overlay")).toBeNull();
	});
});
