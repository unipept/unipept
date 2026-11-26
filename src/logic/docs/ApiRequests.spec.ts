import { afterEach, describe, expect, it, vi } from "vitest";
import { apiCurl, apiFormFields, apiGetUrl, apiResponse } from "./ApiRequests";

describe("apiFormFields", () => {
    it("gives one field per array value, with [] after the name", () => {
        expect(apiFormFields({ input: ["AALTER", "APVLSDSSCK"], equate_il: true, rank: 2 })).toEqual([
            ["input[]", "AALTER"], ["input[]", "APVLSDSSCK"], ["equate_il", "true"], ["rank", "2"]
        ]);
    });
});

describe("apiGetUrl", () => {
    it("shows the URL of the public API with readable names", () => {
        expect(apiGetUrl("pept2lca", { input: ["AIPQLEVARPADAYETAEAYR", "APVLSDSSCK"], extra: true })).toBe(
            "https://api.unipept.ugent.be/api/v2/pept2lca.json?input[]=AIPQLEVARPADAYETAEAYR&input[]=APVLSDSSCK&extra=true"
        );
    });

    it("percent-encodes the values", () => {
        expect(apiGetUrl("pept2lca", { input: ["A&B #C+D"] }))
            .toBe("https://api.unipept.ugent.be/api/v2/pept2lca.json?input[]=A%26B%20%23C%2BD");
    });
});

describe("apiCurl", () => {
    it("sends the parameters as form fields", () => {
        expect(apiCurl("pept2lca", { input: ["APVISDSSCK"], equate_il: true })).toBe(
            "curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/pept2lca \\\n"
            + "  -d 'input[]=APVISDSSCK' -d 'equate_il=true'"
        );
    });

    it("sends the taxa of taxa2tree as counts, which its POST requests take instead of input[]", () => {
        expect(apiCurl("taxa2tree", { input: [817, 329854] })).toBe(
            "curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/taxa2tree \\\n"
            + "  -d 'counts[817]=1' -d 'counts[329854]=1'"
        );
        expect(apiGetUrl("taxa2tree", { input: [817, 329854] }))
            .toBe("https://api.unipept.ugent.be/api/v2/taxa2tree.json?input[]=817&input[]=329854");
    });

    it("escapes single quotes", () => {
        expect(apiCurl("pept2lca", { input: ["A'B"] })).toBe(
            "curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/pept2lca \\\n"
            + "  -d 'input[]=A'\\''B'"
        );
    });

    it("sends a JSON body", () => {
        expect(apiCurl("taxa2tree", {}, { counts: { 817: 3, 329854: 5 } })).toBe(
            "curl -X POST -H 'Accept: application/json' -H 'Content-Type: application/json'"
            + ` api.unipept.ugent.be/api/v2/taxa2tree \\\n  --data '{"counts":{"817":3,"329854":5}}'`
        );
    });
});

describe("apiResponse", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const stubFetch = () => {
        const fetch = vi.fn(async () => new Response(JSON.stringify([{ taxon_id: 1678 }])));
        vi.stubGlobal("fetch", fetch);
        return fetch;
    };

    it("sends a POST request with the parameters as form fields to the given API", async () => {
        const fetch = stubFetch();

        expect(await apiResponse("https://api.example.org", "pept2lca", { input: ["AALTER"], extra: false }))
            .toEqual([{ taxon_id: 1678 }]);
        expect(fetch).toHaveBeenCalledWith("https://api.example.org/api/v2/pept2lca.json", expect.objectContaining({
            method: "POST",
            body: new URLSearchParams([["input[]", "AALTER"], ["extra", "false"]])
        }));
    });

    it("sends the taxa of taxa2tree as counts, like the curl command", async () => {
        const fetch = stubFetch();

        await apiResponse("https://api.example.org", "taxa2tree", { input: [817] });

        expect(fetch).toHaveBeenCalledWith("https://api.example.org/api/v2/taxa2tree.json", expect.objectContaining({
            body: new URLSearchParams([["counts[817]", "1"]])
        }));
    });

    it("sends a POST request with a JSON body", async () => {
        const fetch = stubFetch();

        await apiResponse("https://api.example.org", "taxa2tree", {}, { counts: { 817: 3 } });

        expect(fetch).toHaveBeenCalledWith("https://api.example.org/api/v2/taxa2tree.json", expect.objectContaining({
            method: "POST",
            body: `{"counts":{"817":3}}`
        }));
    });
});
