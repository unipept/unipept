import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NcbiResponseCommunicator from "./NcbiResponseCommunicator";
import { mockFetch, postBodies, type MockRoute } from "../../../../../tests/unit/fetchMock";
import { memoryCache } from "../../../../../tests/unit/lruCacheIdbMock";
import taxa from "../../../../../tests/fixtures/api/taxa.json";
import taxaCount from "../../../../../tests/fixtures/api/taxa-count.json";
import taxaFilter from "../../../../../tests/fixtures/api/taxa-filter.json";
import metadata from "../../../../../tests/fixtures/api/metadata.json";

vi.mock("lru-cache-idb", () => import("../../../../../tests/unit/lruCacheIdbMock"));

const API = "https://api.example.org";
const metadataRoute: MockRoute = { url: `${API}/private_api/metadata`, response: metadata };
const taxaRoute = (response: unknown = taxa): MockRoute =>
    ({ method: "POST", url: `${API}/private_api/taxa`, response });

describe("NcbiResponseCommunicator", () => {
    beforeEach(() => {
        memoryCache.clear();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("getResponses posts the taxon ids and returns the response", async () => {
        const { requests } = mockFetch([metadataRoute, taxaRoute()]);

        const result = await new NcbiResponseCommunicator(API, 100).getResponses([1678, 816]);

        expect(postBodies(requests)).toEqual([{ taxids: [1678, 816] }]);
        expect(result).toEqual(taxa);
    });

    it("getResponses sends the ids in batches of the given size", async () => {
        const { requests } = mockFetch([metadataRoute, taxaRoute([])]);

        await new NcbiResponseCommunicator(API, 2).getResponses([1, 2, 3]);

        expect(postBodies(requests)).toEqual([{ taxids: [1, 2] }, { taxids: [3] }]);
    });

    it("getResponses does not request cached ids again", async () => {
        const communicator = new NcbiResponseCommunicator(API, 100);
        mockFetch([metadataRoute, taxaRoute([taxa[0]])]);
        await communicator.getResponses([1678]);

        const { requests } = mockFetch([metadataRoute, taxaRoute([taxa[1]])]);
        const result = await communicator.getResponses([816, 1678]);

        expect(postBodies(requests)).toEqual([{ taxids: [816] }]);
        expect(result.map(r => r.id).sort((a, b) => a - b)).toEqual([816, 1678]);
    });

    it("getResponses does not use cached ids from another database version", async () => {
        const communicator = new NcbiResponseCommunicator(API, 100);
        mockFetch([metadataRoute, taxaRoute()]);
        await communicator.getResponses([1678, 816]);

        const { requests } = mockFetch([
            { url: `${API}/private_api/metadata`, response: { ...metadata, db_version: "other" } },
            taxaRoute(),
        ]);
        await communicator.getResponses([1678, 816]);

        expect(postBodies(requests)).toEqual([{ taxids: [1678, 816] }]);
    });

    it("getResponses runs concurrent calls one after the other, so the second call uses the cache", async () => {
        const communicator = new NcbiResponseCommunicator(API, 100);
        const { requests } = mockFetch([metadataRoute, taxaRoute()]);

        const [first, second] = await Promise.all([
            communicator.getResponses([1678, 816]),
            communicator.getResponses([1678, 816]),
        ]);

        expect(postBodies(requests)).toHaveLength(1);
        expect(second).toEqual(first);
    });

    it("getResponses rejects when the request fails, and the next call still works", async () => {
        const communicator = new NcbiResponseCommunicator(API, 100);
        mockFetch([metadataRoute, { ...taxaRoute("Internal Server Error"), status: 500 }]);

        await expect(communicator.getResponses([1678])).rejects.toThrow(SyntaxError);

        mockFetch([metadataRoute, taxaRoute([taxa[0]])]);
        await expect(communicator.getResponses([1678])).resolves.toHaveLength(1);
    });

    it("getNcbiCount posts the filter and returns the count", async () => {
        const { requests } = mockFetch([
            { method: "POST", url: `${API}/private_api/taxa/count`, response: taxaCount },
        ]);

        await expect(new NcbiResponseCommunicator(API, 100).getNcbiCount("bacteroides")).resolves.toBe(taxaCount.count);
        expect(postBodies(requests)).toEqual([{ filter: "bacteroides" }]);
    });

    it("getNcbiRange posts the range with the default sort order and returns the ids", async () => {
        const { requests } = mockFetch([
            { method: "POST", url: `${API}/private_api/taxa/filter`, response: taxaFilter },
        ]);

        await expect(new NcbiResponseCommunicator(API, 100).getNcbiRange(0, 3, "bacteroides")).resolves.toEqual(taxaFilter);
        expect(postBodies(requests)).toEqual([{ filter: "bacteroides", start: 0, end: 3, sort_by: "id", sort_descending: false }]);
    });

    it("getNcbiRange posts an empty filter by default", async () => {
        const { requests } = mockFetch([{ method: "POST", url: `${API}/private_api/taxa/filter`, response: [] }]);

        await new NcbiResponseCommunicator(API, 100).getNcbiRange(0, 3);

        expect(postBodies(requests)).toEqual([{ filter: "", start: 0, end: 3, sort_by: "id", sort_descending: false }]);
    });

    it("getNcbiRange posts the given filter and sort order", async () => {
        const { requests } = mockFetch([
            { method: "POST", url: `${API}/private_api/taxa/filter`, response: taxaFilter },
        ]);

        await new NcbiResponseCommunicator(API, 100).getNcbiRange(10, 20, "bacteroides", "name", true);

        expect(postBodies(requests)).toEqual([
            { filter: "bacteroides", start: 10, end: 20, sort_by: "name", sort_descending: true },
        ]);
    });

    // A call that waits for the lock fails with the error of the running call and never sends its own request.
    it.fails("getResponses: a call that waits for a failed call still sends its own request", async () => {
        const communicator = new NcbiResponseCommunicator(API, 100);
        const { requests } = mockFetch([metadataRoute, { ...taxaRoute("Internal Server Error"), status: 500 }]);

        await Promise.allSettled([communicator.getResponses([1678]), communicator.getResponses([816])]);

        expect(postBodies(requests)).toEqual([{ taxids: [1678] }, { taxids: [816] }]);
    });
});
