import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import JSZip from "jszip";
import { ProjectUpgradeManager } from "@/logic/project/ProjectUpgradeManager";
import type { ProjectUpgrader } from "@/logic/project/ProjectUpgrader";
import { SemVer } from "@/logic/project/SemVer";

// Helper to create a zip with a given metadata object
async function createZipWithMetadata(metadata: unknown): Promise<JSZip> {
    const zip = new JSZip();
    zip.file("metadata.json", JSON.stringify(metadata));
    return zip;
}

// We access private static fields through `any` for testing purposes
const ProjectUpgradeManagerAny = ProjectUpgradeManager as any;

const originalUpgraders: ProjectUpgrader[] = [...ProjectUpgradeManagerAny.upgraders];
let originalAppVersion: string;

// Helper to compare the contents of two JSZip instances
async function zipsHaveSameContents(a: JSZip, b: JSZip): Promise<boolean> {
    const aFiles = Object.keys(a.files).sort();
    const bFiles = Object.keys(b.files).sort();
    if (aFiles.length !== bFiles.length) {
        return false;
    }
    if (!aFiles.every((name, idx) => name === bFiles[idx])) {
        return false;
    }

    for (const name of aFiles) {
        const aFile = a.file(name);
        const bFile = b.file(name);
        const aIsDir = aFile === null;
        const bIsDir = bFile === null;
        if (aIsDir !== bIsDir) {
            return false;
        }
        if (!aIsDir && !bIsDir) {
            const aContent = await aFile!.async("string");
            const bContent = await bFile!.async("string");
            if (aContent !== bContent) {
                return false;
            }
        }
    }

    return true;
}

describe("ProjectUpgradeManager", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    beforeAll(() => {
        // Cache and override global APP_VERSION so tests are deterministic
        // @ts-expect-error APP_VERSION is injected at build time in production
        originalAppVersion = globalThis.APP_VERSION ?? "6.3.5";
        // @ts-expect-error APP_VERSION is injected at build time in production
        globalThis.APP_VERSION = "7.0.0";
        // @ts-expect-error APP_VERSION is injected at build time in production
        ProjectUpgradeManagerAny.currentVersion = globalThis.APP_VERSION;
    });

    afterAll(() => {
        // Restore original APP_VERSION after all tests in this suite
        // @ts-expect-error APP_VERSION is injected at build time in production
        globalThis.APP_VERSION = originalAppVersion;
    });

    afterEach(() => {
        // Restore the original static upgraders to avoid cross-test pollution
        ProjectUpgradeManagerAny.upgraders = originalUpgraders;
    });

    it("returns archive unchanged when project is already up to date", async () => {
        const metadata = { version: ProjectUpgradeManagerAny.currentVersion };
        const zip = await createZipWithMetadata(metadata);

        const mgr = new ProjectUpgradeManager();
        const result = await mgr.upgradeIfNeeded(zip);

        expect(result).toBe(zip);
        // Also verify that both archives contain exactly the same files and contents
        expect(await zipsHaveSameContents(zip, result)).toBe(true);
    });

    it("throws when metadata.json is missing", async () => {
        const zip = new JSZip();
        const mgr = new ProjectUpgradeManager();

        await expect(mgr.upgradeIfNeeded(zip)).rejects.toThrow(
            "Failed to find metadata.json while performing project upgrade."
        );
    });

    it("throws when version is missing from metadata", async () => {
        const zip = await createZipWithMetadata({});
        const mgr = new ProjectUpgradeManager();

        await expect(mgr.upgradeIfNeeded(zip)).rejects.toThrow(
            "Project version is missing in metadata.json. Unable to perform upgrade."
        );
    });

    it("invokes applicable upgraders in order for older projects and updates version in metadata", async () => {
        const spyIsOlder = vi.spyOn(SemVer, "isOlder");

        const zip = await createZipWithMetadata({ version: "6.3.4" });

        // Fake upgrader that marks it was called by creating a file
        const firstUpgrader: ProjectUpgrader = {
            name: "first",
            async canUpgrade(z) {
                const meta = JSON.parse(await z.file("metadata.json")!.async("string"));
                return meta.version === "6.3.4";
            },
            async upgrade(z) {
                z.file("first.txt", "first-upgraded");
                const meta = JSON.parse(await z.file("metadata.json")!.async("string"));
                meta.version = "6.3.5";
                z.file("metadata.json", JSON.stringify(meta));
                return z;
            }
        };

        // Second upgrader that only runs after the first adjusted metadata
        const secondUpgrader: ProjectUpgrader = {
            name: "second",
            async canUpgrade(z) {
                const meta = JSON.parse(await z.file("metadata.json")!.async("string"));
                return meta.version === "6.3.5";
            },
            async upgrade(z) {
                z.file("second.txt", "second-upgraded");
                return z;
            }
        };

        ProjectUpgradeManagerAny.upgraders = [firstUpgrader, secondUpgrader];

        const mgr = new ProjectUpgradeManager();
        const result = await mgr.upgradeIfNeeded(zip);

        // SemVer.isOlder should have been consulted
        expect(spyIsOlder).toHaveBeenCalledWith("6.3.4", ProjectUpgradeManagerAny.currentVersion);

        // Both upgraders must have run in sequence
        expect(result.file("first.txt")).not.toBeNull();
        expect(result.file("second.txt")).not.toBeNull();

        // Final metadata version must be set to currentVersion
        const finalMetadata = JSON.parse(await result.file("metadata.json")!.async("string"));
        expect(finalMetadata.version).toBe(ProjectUpgradeManagerAny.currentVersion);
    });

    it("throws when metadata.json is missing after upgraders have run", async () => {
        const zip = await createZipWithMetadata({ version: "6.3.4" });

        const breakingUpgrader: ProjectUpgrader = {
            name: "breaker",
            async canUpgrade() {
                return true;
            },
            async upgrade(z) {
                // Intentionally remove metadata.json to mimic a buggy upgrader
                z.remove("metadata.json");
                return z;
            }
        };

        ProjectUpgradeManagerAny.upgraders = [breakingUpgrader];

        const mgr = new ProjectUpgradeManager();

        await expect(mgr.upgradeIfNeeded(zip)).rejects.toThrow(
            "Failed to find metadata.json after project upgrade."
        );
    });
});
