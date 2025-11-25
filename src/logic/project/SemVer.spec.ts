import { describe, it, expect } from "vitest";
import { SemVer } from "./SemVer";

describe("SemVer", () => {
    describe("parse", () => {
        it("parses simple semantic versions", () => {
            const v = SemVer.parse("1.2.3");
            expect(v.major).toBe(1);
            expect(v.minor).toBe(2);
            expect(v.patch).toBe(3);
            expect(v.preRelease).toBeUndefined();
        });

        it("parses versions with pre-release tags", () => {
            const v = SemVer.parse("1.2.3-alpha.1");
            expect(v.major).toBe(1);
            expect(v.minor).toBe(2);
            expect(v.patch).toBe(3);
            expect(v.preRelease).toBe("alpha.1");
        });

        it("trims surrounding whitespace", () => {
            const v = SemVer.parse("  10.20.30-beta  ");
            expect(v.major).toBe(10);
            expect(v.minor).toBe(20);
            expect(v.patch).toBe(30);
            expect(v.preRelease).toBe("beta");
        });

        it("throws on invalid versions", () => {
            const invalid: string[] = [
                "", // empty
                "1", // too short
                "1.2", // too short
                "1.2.3.4", // too many parts
                "a.b.c", // non-numeric
                "1.2.x", // non-numeric patch
                "1.2.3+build", // build metadata not supported by our parser
                "1.2.3-", // dangling pre-release separator
                "1.2.3- ", // whitespace pre-release
            ];

            for (const v of invalid) {
                expect(() => SemVer.parse(v)).toThrowError();
            }
        });
    });

    describe("compare", () => {
        it("compares major, minor and patch in order", () => {
            expect(SemVer.compare("1.0.0", "2.0.0")).toBeLessThan(0);
            expect(SemVer.compare("2.0.0", "1.0.0")).toBeGreaterThan(0);

            expect(SemVer.compare("1.1.0", "1.2.0")).toBeLessThan(0);
            expect(SemVer.compare("1.2.0", "1.1.0")).toBeGreaterThan(0);

            expect(SemVer.compare("1.2.3", "1.2.4")).toBeLessThan(0);
            expect(SemVer.compare("1.2.4", "1.2.3")).toBeGreaterThan(0);

            expect(SemVer.compare("1.2.3", "1.2.3")).toBe(0);
        });

        it("treats release versions as newer than pre-release versions", () => {
            expect(SemVer.compare("1.0.0-alpha", "1.0.0")).toBeLessThan(0);
            expect(SemVer.compare("1.0.0", "1.0.0-alpha")).toBeGreaterThan(0);
        });

        it("compares different pre-release tags lexicographically when base version is equal", () => {
            expect(SemVer.compare("1.0.0-alpha", "1.0.0-beta")).toBeLessThan(0);
            expect(SemVer.compare("1.0.0-beta", "1.0.0-alpha")).toBeGreaterThan(0);
            expect(SemVer.compare("1.0.0-alpha.1", "1.0.0-alpha.2")).toBeLessThan(0);
        });

        it("returns 0 when both versions (including pre-release) are equal", () => {
            expect(SemVer.compare("1.2.3", "1.2.3")).toBe(0);
            expect(SemVer.compare("1.2.3-alpha.1", "1.2.3-alpha.1")).toBe(0);
        });
    });

    describe("isOlder", () => {
        it("returns true when the first version is strictly older", () => {
            expect(SemVer.isOlder("1.0.0", "2.0.0")).toBe(true);
            expect(SemVer.isOlder("1.2.3", "1.2.4")).toBe(true);
            expect(SemVer.isOlder("1.2.3-alpha", "1.2.3")).toBe(true);
        });

        it("returns false when the versions are equal", () => {
            expect(SemVer.isOlder("1.2.3", "1.2.3")).toBe(false);
            expect(SemVer.isOlder("1.2.3-alpha", "1.2.3-alpha")).toBe(false);
        });

        it("returns false when the first version is newer", () => {
            expect(SemVer.isOlder("2.0.0", "1.0.0")).toBe(false);
            expect(SemVer.isOlder("1.2.4", "1.2.3")).toBe(false);
            expect(SemVer.isOlder("1.2.3", "1.2.3-alpha")).toBe(false);
        });
    });
});
