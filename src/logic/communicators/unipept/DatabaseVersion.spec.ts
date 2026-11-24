import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDatabaseVersion, forgetDatabaseVersions } from "./DatabaseVersion";
import { mockFetch } from "../../../../tests/unit/fetchMock";

const API = "https://api.example.org";
const OTHER_API = "https://other.example.org";
const metadataRoute = (url: string, version: string) => ({ url: `${url}/private_api/metadata`, response: { db_version: version } });

describe("fetchDatabaseVersion", () => {
    beforeEach(() => {
        forgetDatabaseVersions();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("requests the version once per API", async () => {
        const { requests } = mockFetch([metadataRoute(API, "2026.04"), metadataRoute(OTHER_API, "2025.01")]);

        expect(await fetchDatabaseVersion(API)).toBe("2026.04");
        expect(await fetchDatabaseVersion(API)).toBe("2026.04");
        expect(await fetchDatabaseVersion(OTHER_API)).toBe("2025.01");

        expect(requests.map(r => r.url)).toEqual([`${API}/private_api/metadata`, `${OTHER_API}/private_api/metadata`]);
    });

    it("requests the version again after five minutes", async () => {
        vi.useFakeTimers();
        mockFetch([metadataRoute(API, "2026.04")]);
        await fetchDatabaseVersion(API);

        vi.advanceTimersByTime(5 * 60 * 1000);
        const { requests } = mockFetch([metadataRoute(API, "2026.05")]);

        expect(await fetchDatabaseVersion(API)).toBe("2026.05");
        expect(requests).toHaveLength(1);
    });

    it("does not keep a failed request", async () => {
        mockFetch([{ url: `${API}/private_api/metadata`, response: { error: "x" }, status: 500 }]);
        await expect(fetchDatabaseVersion(API)).rejects.toThrow(/Request failed: 500/);

        mockFetch([metadataRoute(API, "2026.04")]);
        await expect(fetchDatabaseVersion(API)).resolves.toBe("2026.04");
    });
});
