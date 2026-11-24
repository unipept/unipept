import { afterEach, describe, expect, it, vi } from "vitest";
import ProtinfoCommunicator from "./ProtinfoCommunicator";
import { mockFetch, postBodies, type MockRoute } from "../../../../../tests/unit/fetchMock";
import protinfo from "../../../../../tests/fixtures/api/protinfo.json";

const API = "https://api.example.org";
const protinfoRoute = (response: unknown = protinfo): MockRoute =>
    ({ method: "POST", url: `${API}/api/v2/protinfo`, response });

describe("ProtinfoCommunicator", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("posts the proteins and returns the responses by protein", async () => {
        const { requests } = mockFetch([protinfoRoute()]);

        const result = await new ProtinfoCommunicator(API, 100).getResponses("P12345", "P00330");

        expect(postBodies(requests)).toEqual([{ input: ["P12345", "P00330"] }]);
        expect([...result.keys()]).toEqual(["P12345", "P00330"]);
        expect(result.get("P12345")).toEqual(protinfo[0]);
    });

    it("sends the proteins in batches of the given size", async () => {
        const { requests } = mockFetch([protinfoRoute([])]);

        await new ProtinfoCommunicator(API, 2).getResponses("A", "B", "C");

        expect(postBodies(requests)).toEqual([{ input: ["A", "B"] }, { input: ["C"] }]);
    });

    it("rejects when the request fails, and the next call still works", async () => {
        const communicator = new ProtinfoCommunicator(API, 100);
        mockFetch([{ ...protinfoRoute({ error: "x" }), status: 500 }]);

        await expect(communicator.getResponses("P12345")).rejects.toThrow(/Request failed: 500/);

        mockFetch([protinfoRoute()]);
        await expect(communicator.getResponses("P12345")).resolves.toBeInstanceOf(Map);
    });

    it("a call that waits for a failed call still sends its own request", async () => {
        const communicator = new ProtinfoCommunicator(API, 100);
        const { requests } = mockFetch([{ ...protinfoRoute({ error: "x" }), status: 500 }]);

        await Promise.allSettled([communicator.getResponses("P12345"), communicator.getResponses("P00330")]);

        expect(postBodies(requests)).toEqual([{ input: ["P12345"] }, { input: ["P00330"] }]);
    });
});
