import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EcResponseCommunicator from "./EcResponseCommunicator";
import GoResponseCommunicator from "./GoResponseCommunicator";
import InterproResponseCommunicator from "./InterproResponseCommunicator";
import { mockFetch, postBodies, type MockRoute } from "../../../../../tests/unit/fetchMock";
import { memoryCache } from "../../../../../tests/unit/lruCacheIdbMock";
import ecnumbers from "../../../../../tests/fixtures/api/ecnumbers.json";
import goterms from "../../../../../tests/fixtures/api/goterms.json";
import interpros from "../../../../../tests/fixtures/api/interpros.json";
import metadata from "../../../../../tests/fixtures/api/metadata.json";

vi.mock("lru-cache-idb", () => import("../../../../../tests/unit/lruCacheIdbMock"));

const API = "https://api.example.org";
const metadataRoute: MockRoute = { url: `${API}/private_api/metadata`, response: metadata };
const ecRoute = (response: unknown = ecnumbers): MockRoute =>
    ({ method: "POST", url: `${API}/private_api/ecnumbers`, response });

describe("FunctionalResponseCommunicator", () => {
    beforeEach(() => {
        memoryCache.clear();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("EC: posts the numbers without prefix and returns them with the EC: prefix", async () => {
        const { requests } = mockFetch([metadataRoute, ecRoute()]);

        const result = await new EcResponseCommunicator(API, 100).getResponses(["EC:1.1.1.1", "EC:2.7.11.1"]);

        expect(postBodies(requests)).toEqual([{ ecnumbers: ["1.1.1.1", "2.7.11.1"] }]);
        expect(requests.find(r => r.method === "POST")!.headers["content-type"]).toBe("application/json");
        expect(result).toEqual(ecnumbers.map(e => ({ ...e, code: `EC:${e.code}` })));
    });

    it("GO: posts the terms as they are and returns the response unchanged", async () => {
        const { requests } = mockFetch([
            metadataRoute,
            { method: "POST", url: `${API}/private_api/goterms`, response: goterms },
        ]);

        const result = await new GoResponseCommunicator(API, 100).getResponses(["GO:0005737", "GO:0016301"]);

        expect(postBodies(requests)).toEqual([{ goterms: ["GO:0005737", "GO:0016301"] }]);
        expect(result).toEqual(goterms);
    });

    it("InterPro: posts the codes without prefix and sets the namespace from the category", async () => {
        const { requests } = mockFetch([
            metadataRoute,
            { method: "POST", url: `${API}/private_api/interpros`, response: interpros },
        ]);

        const result = await new InterproResponseCommunicator(API, 100).getResponses(["IPR:IPR000719", "IPR:IPR011009"]);

        expect(postBodies(requests)).toEqual([{ interpros: ["IPR000719", "IPR011009"] }]);
        expect(result.map(r => [r.code, r.namespace])).toEqual([
            ["IPR:IPR000719", "domain"],
            ["IPR:IPR011009", "homologous superfamily"],
        ]);
    });

    it("sends the codes in batches of the given size", async () => {
        const { requests } = mockFetch([metadataRoute, ecRoute([])]);

        await new EcResponseCommunicator(API, 2).getResponses(["EC:1", "EC:2", "EC:3", "EC:4", "EC:5"]);

        expect(postBodies(requests)).toEqual([
            { ecnumbers: ["1", "2"] },
            { ecnumbers: ["3", "4"] },
            { ecnumbers: ["5"] },
        ]);
    });

    it("does not request cached codes again", async () => {
        const communicator = new EcResponseCommunicator(API, 100);
        mockFetch([metadataRoute, ecRoute([ecnumbers[0]])]);
        await communicator.getResponses(["EC:1.1.1.1"]);

        const { requests } = mockFetch([metadataRoute, ecRoute([ecnumbers[1]])]);
        const result = await communicator.getResponses(["EC:2.7.11.1", "EC:1.1.1.1"]);

        expect(postBodies(requests)).toEqual([{ ecnumbers: ["2.7.11.1"] }]);
        expect(result.map(r => r.code).sort()).toEqual(["EC:1.1.1.1", "EC:2.7.11.1"]);
    });

    it("does not use cached codes from another database version", async () => {
        const communicator = new EcResponseCommunicator(API, 100);
        mockFetch([metadataRoute, ecRoute()]);
        await communicator.getResponses(["EC:1.1.1.1", "EC:2.7.11.1"]);

        const { requests } = mockFetch([
            { url: `${API}/private_api/metadata`, response: { ...metadata, db_version: "other" } },
            ecRoute(),
        ]);
        await communicator.getResponses(["EC:1.1.1.1", "EC:2.7.11.1"]);

        expect(postBodies(requests)).toEqual([{ ecnumbers: ["1.1.1.1", "2.7.11.1"] }]);
    });

    it("runs concurrent calls one after the other, so the second call uses the cache", async () => {
        const communicator = new EcResponseCommunicator(API, 100);
        const { requests } = mockFetch([metadataRoute, ecRoute()]);

        const [first, second] = await Promise.all([
            communicator.getResponses(["EC:1.1.1.1", "EC:2.7.11.1"]),
            communicator.getResponses(["EC:1.1.1.1", "EC:2.7.11.1"]),
        ]);

        expect(postBodies(requests)).toHaveLength(1);
        expect(second).toEqual(first);
    });

    it("rejects when the request fails, and the next call still works", async () => {
        const communicator = new EcResponseCommunicator(API, 100);
        mockFetch([metadataRoute, { ...ecRoute({ error: "Internal Server Error" }), status: 500 }]);

        await expect(communicator.getResponses(["EC:1.1.1.1"])).rejects.toThrow(/Request failed: 500/);

        mockFetch([metadataRoute, ecRoute([ecnumbers[0]])]);
        await expect(communicator.getResponses(["EC:1.1.1.1"])).resolves.toHaveLength(1);
    });

    // A call that waits for the lock fails with the error of the running call and never sends its own request.
    it.fails("a call that waits for a failed call still sends its own request", async () => {
        const communicator = new EcResponseCommunicator(API, 100);
        const { requests } = mockFetch([metadataRoute, { ...ecRoute({ error: "Internal Server Error" }), status: 500 }]);

        await Promise.allSettled([
            communicator.getResponses(["EC:1.1.1.1"]),
            communicator.getResponses(["EC:2.7.11.1"]),
        ]);

        expect(postBodies(requests)).toEqual([{ ecnumbers: ["1.1.1.1"] }, { ecnumbers: ["2.7.11.1"] }]);
    });
});
