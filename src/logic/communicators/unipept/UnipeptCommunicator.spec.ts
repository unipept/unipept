import { afterEach, describe, expect, it, vi } from "vitest";
import UnipeptCommunicator from "./UnipeptCommunicator";
import { DEFAULT_API_BASE_URL } from "@/logic/Constants";
import { mockFetch } from "../../../../tests/unit/fetchMock";
import pept2lca from "../../../../tests/fixtures/api/pept2lca.json";
import taxa2tree from "../../../../tests/fixtures/api/taxa2tree.json";
import taxa2rank from "../../../../tests/fixtures/api/taxa2rank.json";
import metadata from "../../../../tests/fixtures/api/metadata.json";

const API = DEFAULT_API_BASE_URL;

const queryOf = (url: string) => new URL(url).searchParams;

describe("UnipeptCommunicator", () => {
    const communicator = new UnipeptCommunicator();

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("pept2lca requests every peptide and returns the parsed response", async () => {
        const { requests } = mockFetch([{ url: /\/api\/v2\/pept2lca\.json\?/, response: pept2lca }]);

        const result = await communicator.pept2lca(["AALTER", "MDGTEYIIVK"]);

        expect(result).toEqual(pept2lca);
        expect(requests).toHaveLength(1);
        expect(requests[0].url.startsWith(`${API}/api/v2/pept2lca.json?`)).toBe(true);
        const query = queryOf(requests[0].url);
        expect(query.getAll("input[]")).toEqual(["AALTER", "MDGTEYIIVK"]);
        expect(query.get("equate_il")).toBe("true");
        expect(query.get("extra")).toBe("false");
        expect(query.get("names")).toBe("false");
    });

    it.each([
        ["pept2prot", (c: UnipeptCommunicator) => c.pept2prot(["AALTER"], false, true), ["AALTER"], { equate_il: "false", extra: "true" }],
        ["pept2taxa", (c: UnipeptCommunicator) => c.pept2taxa(["AALTER"], true, true, true), ["AALTER"], { equate_il: "true", extra: "true", names: "true" }],
        ["pept2ec", (c: UnipeptCommunicator) => c.pept2ec(["AALTER"]), ["AALTER"], { equate_il: "true", extra: "false" }],
        ["pept2go", (c: UnipeptCommunicator) => c.pept2go(["AALTER"], true, false, true), ["AALTER"], { equate_il: "true", extra: "false", domains: "true" }],
        ["pept2interpro", (c: UnipeptCommunicator) => c.pept2interpro(["AALTER"]), ["AALTER"], { equate_il: "true", extra: "false", domains: "false" }],
        ["pept2funct", (c: UnipeptCommunicator) => c.pept2funct(["AALTER"]), ["AALTER"], { equate_il: "true", extra: "false", domains: "false" }],
        ["peptinfo", (c: UnipeptCommunicator) => c.peptinfo(["AALTER"]), ["AALTER"], { equate_il: "true", extra: "false", domains: "false", names: "false" }],
        ["protinfo", (c: UnipeptCommunicator) => c.protinfo(["P12345"]), ["P12345"], { extra: "false", domains: "false", names: "false" }],
        ["taxa2lca", (c: UnipeptCommunicator) => c.taxa2lca(["1678", "816"]), ["1678", "816"], { extra: "false", names: "false" }],
        ["taxa2tree", (c: UnipeptCommunicator) => c.taxa2tree(["1678"], true), ["1678"], { link: "true" }],
        ["taxonomy", (c: UnipeptCommunicator) => c.taxonomy(["1678"], true), ["1678"], { extra: "true", names: "false" }],
    ])("%s sends a GET to its endpoint with the given inputs and options", async (endpoint, call, inputs, expected) => {
        const { requests } = mockFetch([{ url: new RegExp(`/api/v2/${endpoint}\\.json\\?`), response: [] }]);

        await call(communicator);

        expect(requests).toHaveLength(1);
        expect(requests[0].method).toBe("GET");
        const query = queryOf(requests[0].url);
        for (const [key, value] of Object.entries(expected)) {
            expect(query.get(key)).toBe(value);
        }
        expect(query.getAll("input[]")).toEqual(inputs);
    });

    it("taxa2treeCounts posts the counts as JSON", async () => {
        const { requests } = mockFetch([{ method: "POST", url: `${API}/api/v2/taxa2tree.json`, response: taxa2tree }]);

        const result = await communicator.taxa2treeCounts({ "1678": 2, "816": 1 });

        expect(result).toEqual(taxa2tree);
        expect(requests[0].headers["content-type"]).toBe("application/json");
        expect(JSON.parse(requests[0].body!)).toEqual({ counts: { "1678": 2, "816": 1 }, link: false });
    });

    it("taxa2rank posts to the private API and returns the mapped taxa", async () => {
        const { requests } = mockFetch([{ method: "POST", url: `${API}/private_api/taxa2rank.json?`, response: taxa2rank }]);

        const result = await communicator.taxa2rank([[1678, 816]], "genus");

        expect(result).toEqual(taxa2rank.mapped_taxa);
        expect(JSON.parse(requests[0].body!)).toEqual({ taxa: [[1678, 816]], rank: "genus" });
    });

    it("uniprotVersion returns the database version from the private API", async () => {
        mockFetch([{ url: `${API}/private_api/metadata?`, response: metadata }]);

        await expect(communicator.uniprotVersion()).resolves.toBe(metadata.db_version);
    });
});
