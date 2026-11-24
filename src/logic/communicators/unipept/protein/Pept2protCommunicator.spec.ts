import { afterEach, describe, expect, it, vi } from "vitest";
import Pept2protCommunicator from "./Pept2protCommunicator";
import { mockFetch, postBodies, type MockRoute } from "../../../../../tests/unit/fetchMock";
import pept2prot from "../../../../../tests/fixtures/api/pept2prot.json";

const API = "https://api.example.org";
const pept2protRoute = (response: unknown = pept2prot): MockRoute =>
    ({ method: "POST", url: `${API}/api/v2/pept2prot`, response });

describe("Pept2protCommunicator", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("posts the peptide with extra information and returns the response", async () => {
        const { requests } = mockFetch([pept2protRoute()]);

        const result = await new Pept2protCommunicator(API).getResponses("MDGTEYIIVK", true);

        expect(postBodies(requests)).toEqual([{ input: ["MDGTEYIIVK"], equate_il: true, extra: true }]);
        expect(result).toEqual(pept2prot);
    });

    it("runs concurrent calls one at a time", async () => {
        const { fetch: stub } = mockFetch([pept2protRoute([])]);
        let running = 0;
        let maxRunning = 0;
        vi.stubGlobal("fetch", async (...args: Parameters<typeof fetch>) => {
            running++;
            maxRunning = Math.max(maxRunning, running);
            try {
                await new Promise(resolve => setTimeout(resolve, 0));
                return await stub(...args);
            } finally {
                running--;
            }
        });
        const communicator = new Pept2protCommunicator(API);

        await Promise.all(["A", "B", "C"].map(peptide => communicator.getResponses(peptide, false)));

        expect(stub).toHaveBeenCalledTimes(3);
        expect(maxRunning).toBe(1);
    });

    it("rejects when the request fails, and the next call still works", async () => {
        const communicator = new Pept2protCommunicator(API);
        mockFetch([{ ...pept2protRoute({ error: "x" }), status: 500 }]);

        await expect(communicator.getResponses("MDGTEYIIVK", true)).rejects.toThrow(/Request failed: 500/);

        mockFetch([pept2protRoute()]);
        await expect(communicator.getResponses("MDGTEYIIVK", true)).resolves.toEqual(pept2prot);
    });

    it("a call that waits for a failed call still sends its own request", async () => {
        const communicator = new Pept2protCommunicator(API);
        const { requests } = mockFetch([{ ...pept2protRoute({ error: "x" }), status: 500 }]);

        await Promise.allSettled([communicator.getResponses("A", true), communicator.getResponses("B", true)]);

        expect(postBodies(requests).map(b => (b as { input: string[] }).input)).toEqual([["A"], ["B"]]);
    });
});
