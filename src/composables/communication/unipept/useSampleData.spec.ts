import { afterEach, describe, expect, it, vi } from "vitest";
import useSampleData from "./useSampleData";
import { mockFetch } from "../../../../tests/unit/fetchMock";

const API = "https://api.example.org";
const sample = { id: 1, environment: "Human Gut", reference: "ref", url: "https://example.org", datasets: [] };

describe("useSampleData", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("posts to the sample data endpoint and sets the samples", async () => {
        const { requests } = mockFetch([{ method: "POST", url: `${API}/datasets/sampledata`, response: { sample_data: [sample] } }]);
        const { samples, process } = useSampleData(API);

        await process();

        expect(requests).toHaveLength(1);
        expect(samples.value).toEqual([sample]);
    });

    it("throws and keeps the samples empty when the API returns an error", async () => {
        mockFetch([{ method: "POST", url: `${API}/datasets/sampledata`, response: { error: "x" }, status: 500 }]);
        const { samples, process } = useSampleData(API);

        await expect(process()).rejects.toThrow(/Request failed: 500/);
        expect(samples.value).toEqual([]);
    });
});
