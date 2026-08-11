import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cn, formatNumber, formatRelativeDate, slugify } from "./utils";

describe("cn", () => {
	it("merges class names", () => {
		expect(cn("px-2", "py-1")).toBe("px-2 py-1");
	});

	it("resolves conflicting tailwind classes", () => {
		expect(cn("px-2", "px-4")).toBe("px-4");
	});

	it("handles conditional classes", () => {
		expect(cn("base", false && "hidden", "visible")).toBe("base visible");
	});
});

describe("slugify", () => {
	it("lowercases and replaces spaces with hyphens", () => {
		expect(slugify("Hello World")).toBe("hello-world");
	});

	it("removes special characters", () => {
		expect(slugify("Hello, World!")).toBe("hello-world");
	});

	it("preserves letters, numbers, and hyphens", () => {
		expect(slugify("User-Name-123")).toBe("user-name-123");
	});
});

describe("formatNumber", () => {
	it("formats numbers with compact notation", () => {
		expect(formatNumber(999)).toBe("999");
		expect(formatNumber(1500)).toBe("1.5K");
		expect(formatNumber(1_000_000)).toBe("1M");
	});
});

describe("formatRelativeDate", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2025-06-15T12:00:00"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns relative time for dates within the last 24 hours", () => {
		const twoHoursAgo = new Date("2025-06-15T10:00:00");
		expect(formatRelativeDate(twoHoursAgo)).toBe("2 hours ago");
	});

	it("returns month and day for dates in the same year", () => {
		const earlierThisYear = new Date("2025-03-10T08:00:00");
		expect(formatRelativeDate(earlierThisYear)).toBe("Mar 10");
	});

	it("includes the year for dates from a different year", () => {
		const lastYear = new Date("2024-12-01T08:00:00");
		expect(formatRelativeDate(lastYear)).toBe("Dec 1, 2024");
	});
});
