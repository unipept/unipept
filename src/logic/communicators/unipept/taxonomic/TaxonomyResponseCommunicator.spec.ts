import { afterEach, describe, expect, it, vi } from "vitest";
import TaxonomyResponseCommunicator from "./TaxonomyResponseCommunicator";
import { mockFetch, postBodies, type MockRoute } from "../../../../../tests/unit/fetchMock";
import taxonomy from "../../../../../tests/fixtures/api/taxonomy.json";

const API = "https://api.example.org";
const taxonomyRoute = (response: unknown = taxonomy): MockRoute =>
    ({ method: "POST", url: `${API}/api/v2/taxonomy`, response });

describe("TaxonomyResponseCommunicator", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("posts the ids with descendants and returns the response", async () => {
        const { requests } = mockFetch([taxonomyRoute()]);

        const result = await new TaxonomyResponseCommunicator(API, 100).getResponses([1680]);

        expect(JSON.parse(requests[0].body!)).toEqual({ input: [1680], descendants: true });
        expect(result).toEqual(taxonomy);
    });

    it("rejects when the request fails, and the next call still works", async () => {
        const communicator = new TaxonomyResponseCommunicator(API, 100);
        mockFetch([{ ...taxonomyRoute("Internal Server Error"), status: 500 }]);

        await expect(communicator.getResponses([1680])).rejects.toThrow(SyntaxError);

        mockFetch([taxonomyRoute()]);
        await expect(communicator.getResponses([1680])).resolves.toEqual(taxonomy);
    });

    // A call that waits for the lock fails with the error of the running call and never sends its own request.
    it.fails("a call that waits for a failed call still sends its own request", async () => {
        const communicator = new TaxonomyResponseCommunicator(API, 100);
        const { requests } = mockFetch([{ ...taxonomyRoute("Internal Server Error"), status: 500 }]);

        await Promise.allSettled([communicator.getResponses([1680]), communicator.getResponses([1678])]);

        expect(postBodies(requests)).toEqual([
            { input: [1680], descendants: true },
            { input: [1678], descendants: true },
        ]);
    });
});
