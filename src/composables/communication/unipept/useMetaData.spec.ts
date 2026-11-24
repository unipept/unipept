import { afterEach, describe, expect, it, vi } from "vitest";
import useMetaData from "./useMetaData";
import { mockFetch } from "../../../../tests/unit/fetchMock";
import metadata from "../../../../tests/fixtures/api/metadata.json";

const API = "https://api.example.org";

describe("useMetaData", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("sets the database version from the API", async () => {
        mockFetch([{ url: `${API}/private_api/metadata`, response: metadata }]);
        const { databaseVersion, process } = useMetaData(API);

        await process();

        expect(databaseVersion.value).toBe(metadata.db_version);
    });

    it("throws and keeps the version empty when the API returns an error", async () => {
        mockFetch([{ url: `${API}/private_api/metadata`, response: { error: "x" }, status: 500 }]);
        const { databaseVersion, process } = useMetaData(API);

        await expect(process()).rejects.toThrow(/Request failed: 500/);
        expect(databaseVersion.value).toBe("");
    });
});
