import { afterEach, describe, expect, it, vi } from "vitest";
import ProteomeCommunicator from "./ProteomeCommunicator";
import { mockFetch, postBodies, type MockRoute } from "../../../../../tests/unit/fetchMock";
import proteomes from "../../../../../tests/fixtures/api/proteomes.json";
import proteomesCount from "../../../../../tests/fixtures/api/proteomes-count.json";
import proteomesFilter from "../../../../../tests/fixtures/api/proteomes-filter.json";

const API = "https://api.example.org";
const proteomesRoute = (response: unknown = proteomes): MockRoute =>
    ({ method: "POST", url: `${API}/private_api/proteomes`, response });
const filterRoute = (response: unknown = proteomesFilter): MockRoute =>
    ({ method: "POST", url: `${API}/private_api/proteomes/filter`, response });

describe("ProteomeCommunicator", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("getResponses posts the proteome ids and returns the response", async () => {
        const { requests } = mockFetch([proteomesRoute()]);

        const result = await new ProteomeCommunicator(API, 100).getResponses(["UP000005640", "UP000000625"]);

        expect(postBodies(requests)).toEqual([{ proteomes: ["UP000005640", "UP000000625"] }]);
        expect(result).toEqual(proteomes);
    });

    it("getResponses sends the ids in batches of the given size", async () => {
        const { requests } = mockFetch([proteomesRoute([])]);

        await new ProteomeCommunicator(API, 2).getResponses(["A", "B", "C"]);

        expect(postBodies(requests)).toEqual([{ proteomes: ["A", "B"] }, { proteomes: ["C"] }]);
    });

    it("getResponses rejects when the request fails, and the next call still works", async () => {
        const communicator = new ProteomeCommunicator(API, 100);
        mockFetch([{ ...proteomesRoute({ error: "x" }), status: 500 }]);

        await expect(communicator.getResponses(["UP000005640"])).rejects.toThrow(/Request failed: 500/);

        mockFetch([proteomesRoute()]);
        await expect(communicator.getResponses(["UP000005640"])).resolves.toEqual(proteomes);
    });

    it("getResponses: a call that waits for a failed call still sends its own request", async () => {
        const communicator = new ProteomeCommunicator(API, 100);
        const { requests } = mockFetch([{ ...proteomesRoute({ error: "x" }), status: 500 }]);

        await Promise.allSettled([communicator.getResponses(["UP000005640"]), communicator.getResponses(["UP000000625"])]);

        expect(postBodies(requests)).toEqual([{ proteomes: ["UP000005640"] }, { proteomes: ["UP000000625"] }]);
    });

    it("getProteomeCount posts the filter and returns the count", async () => {
        const { requests } = mockFetch([
            { method: "POST", url: `${API}/private_api/proteomes/count`, response: proteomesCount },
        ]);

        await expect(new ProteomeCommunicator(API, 100).getProteomeCount("UP0000056")).resolves.toBe(proteomesCount.count);
        expect(postBodies(requests)).toEqual([{ filter: "UP0000056" }]);
    });

    it("getProteomeRange posts the range with the default sort order and returns the ids", async () => {
        const { requests } = mockFetch([filterRoute()]);

        await expect(new ProteomeCommunicator(API, 100).getProteomeRange(0, 3, "UP0000056")).resolves.toEqual(proteomesFilter);
        expect(postBodies(requests)).toEqual([
            { start: 0, end: 3, filter: "UP0000056", sort_by: "id", sort_descending: false },
        ]);
    });

    it("getProteomeRange posts an empty filter by default and the given sort order", async () => {
        const { requests } = mockFetch([filterRoute([])]);
        const communicator = new ProteomeCommunicator(API, 100);

        await communicator.getProteomeRange(0, 3);
        await communicator.getProteomeRange(10, 20, "", "protein_count", true);

        expect(postBodies(requests)).toEqual([
            { start: 0, end: 3, filter: "", sort_by: "id", sort_descending: false },
            { start: 10, end: 20, filter: "", sort_by: "protein_count", sort_descending: true },
        ]);
    });
});
