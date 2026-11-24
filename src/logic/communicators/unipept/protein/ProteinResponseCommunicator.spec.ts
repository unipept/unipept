import { afterEach, describe, expect, it, vi } from "vitest";
import ProteinResponseCommunicator from "./ProteinResponseCommunicator";
import { mockFetch, postBodies, type MockRoute } from "../../../../../tests/unit/fetchMock";
import proteins from "../../../../../tests/fixtures/api/proteins.json";
import proteinsCount from "../../../../../tests/fixtures/api/proteins-count.json";
import proteinsFilter from "../../../../../tests/fixtures/api/proteins-filter.json";

const API = "https://api.example.org";
const proteinsRoute = (response: unknown = proteins): MockRoute =>
    ({ method: "POST", url: `${API}/private_api/proteins`, response });
const filterRoute = (response: unknown = proteinsFilter): MockRoute =>
    ({ method: "POST", url: `${API}/private_api/proteins/filter`, response });

describe("ProteinResponseCommunicator", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("getResponses posts the accessions and returns the response", async () => {
        const { requests } = mockFetch([proteinsRoute()]);

        const result = await new ProteinResponseCommunicator(API, 100).getResponses(["P12345", "P00330"]);

        expect(postBodies(requests)).toEqual([{ accessions: ["P12345", "P00330"] }]);
        expect(result).toEqual(proteins);
    });

    it("getResponses sends the accessions in batches of the given size", async () => {
        const { requests } = mockFetch([proteinsRoute([])]);

        await new ProteinResponseCommunicator(API, 2).getResponses(["A", "B", "C"]);

        expect(postBodies(requests)).toEqual([{ accessions: ["A", "B"] }, { accessions: ["C"] }]);
    });

    it("getResponses rejects when the request fails, and the next call still works", async () => {
        const communicator = new ProteinResponseCommunicator(API, 100);
        mockFetch([{ ...proteinsRoute({ error: "x" }), status: 500 }]);

        await expect(communicator.getResponses(["P12345"])).rejects.toThrow(/Request failed: 500/);

        mockFetch([proteinsRoute()]);
        await expect(communicator.getResponses(["P12345"])).resolves.toEqual(proteins);
    });

    it("getResponses: a call that waits for a failed call still sends its own request", async () => {
        const communicator = new ProteinResponseCommunicator(API, 100);
        const { requests } = mockFetch([{ ...proteinsRoute({ error: "x" }), status: 500 }]);

        await Promise.allSettled([communicator.getResponses(["P12345"]), communicator.getResponses(["P00330"])]);

        expect(postBodies(requests)).toEqual([{ accessions: ["P12345"] }, { accessions: ["P00330"] }]);
    });

    it("getProteinCount posts the filter and returns the count", async () => {
        const { requests } = mockFetch([
            { method: "POST", url: `${API}/private_api/proteins/count`, response: proteinsCount },
        ]);

        await expect(new ProteinResponseCommunicator(API, 100).getProteinCount("kinase")).resolves.toBe(proteinsCount.count);
        expect(postBodies(requests)).toEqual([{ filter: "kinase" }]);
    });

    it("getProteinRange posts the range with the default sort order and returns the accessions", async () => {
        const { requests } = mockFetch([filterRoute()]);

        await expect(new ProteinResponseCommunicator(API, 100).getProteinRange(0, 3, "kinase")).resolves.toEqual(proteinsFilter);
        expect(postBodies(requests)).toEqual([
            { filter: "kinase", start: 0, end: 3, sort_by: "uniprot_accession_number", sort_descending: false },
        ]);
    });

    it("getProteinRange posts an empty filter by default and the given sort order", async () => {
        const { requests } = mockFetch([filterRoute([])]);
        const communicator = new ProteinResponseCommunicator(API, 100);

        await communicator.getProteinRange(0, 3);
        await communicator.getProteinRange(10, 20, "", "name", true);

        expect(postBodies(requests)).toEqual([
            { filter: "", start: 0, end: 3, sort_by: "uniprot_accession_number", sort_descending: false },
            { filter: "", start: 10, end: 20, sort_by: "name", sort_descending: true },
        ]);
    });
});
