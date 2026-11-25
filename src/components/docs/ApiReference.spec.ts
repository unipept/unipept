import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { createMemoryHistory, createRouter } from "vue-router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import type { ApiReferenceData } from "@/logic/docs/ApiReference";
import ApiJsonView from "./ApiJsonView.vue";
import ApiResponseBlock from "./ApiResponseBlock.vue";
import ApiReference from "./ApiReference.vue";

const api: ApiReferenceData = {
    endpoint: "pept2lca",
    parameters: [
        { name: "input[]", type: "string", required: true, summary: "Peptide to search for." },
        { name: "equate_il", type: "boolean", default: true, summary: "Equate I and L.", details: "<p>As in the analysis.</p>" },
        { name: "extra", type: "boolean", default: false, summary: "Return the lineage." },
        { name: "names", type: "boolean", default: false, summary: "Return names." }
    ],
    response: {
        summary: "<p>A list of objects.</p>",
        fields: [
            { name: "peptide", type: "string", summary: "The peptide." },
            { name: "ec", type: "list of objects", summary: "EC numbers.", fields: [{ name: "ec_number", type: "string", summary: "The number." }] },
            { name: "<rank>_name", type: "string", summary: "Names.", when: "extra and names", names: ["domain_name", "realm_name"] }
        ]
    },
    examples: [
        { title: "One peptide", description: "<p>The LCA of AALTER.</p>", params: { input: ["AALTER"] } },
        { id: "example2", title: "Counts", json: { counts: { 817: 3 } } }
    ]
};

async function render(component: object, props: Record<string, unknown>, slot?: string): Promise<string> {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/", component: { render: () => null } }] });
    await router.push("/");
    const app = createSSRApp({ render: () => h(component, props, slot ? () => h("div", { class: "vp-doc" }, slot) : undefined) });
    app.use(router).use(createVuetify({ components }));
    return renderToString(app);
}

const ids = (html: string) => [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);

describe("ApiReference", () => {
    it("shows the endpoint, the page text and the parameters with their tags", async () => {
        const html = await render(ApiReference, { api }, "Intro text.");

        expect(html).toMatch(/>POST<\/span>.*>GET<\/span>.*https:\/\/api\.unipept\.ugent\.be\/api\/v2\/pept2lca/s);
        expect(html).toContain("Intro text.");
        expect(html).toMatch(/<code class="api-field__name"[^>]*>input\[\]<\/code>.*required/s);
        expect(html).toContain("default true");
        expect(html).toContain("<p>As in the analysis.</p>");
    });

    it("shows the response fields with their conditions, child fields and field groups", async () => {
        const html = await render(ApiReference, { api });

        expect(html).toContain("<p>A list of objects.</p>");
        const when = html.match(/<span class="api-field__tag api-field__tag--when"[^>]*>(.*?)<\/span>/s)?.[1] ?? "";
        expect(when.replace(/<!--.*?-->/g, "").replace(/\s+/g, " ")).toMatch(/with <code[^>]*>extra<\/code> and <code[^>]*>names<\/code>/);
        expect(html).toMatch(/1 fields<\/summary>.*ec_number/s);
        expect(html).toMatch(/2 fields<\/summary>.*domain_name.*realm_name/s);
    });

    it("keeps the anchors of the old pages", async () => {
        expect(ids(await render(ApiReference, { api }))).toEqual(
            expect.arrayContaining(["request", "parameters", "response", "examples", "example2", "try"])
        );
    });

    it("chooses the first example and shows its request", async () => {
        const html = await render(ApiReference, { api });

        expect(html).toMatch(/v-select__selection-text[^>]*>\s*One peptide/);
        expect(html).toContain("<p>The LCA of AALTER.</p>");
        expect(html).toContain("api.unipept.ugent.be/api/v2/pept2lca \\\n  -d &#39;input[]=AALTER&#39;");
        expect(html).toContain("Try it ▶");
    });
});

describe("ApiJsonView", () => {
    it("opens the list and its first item, and folds the rest with a preview", async () => {
        const html = await render(ApiJsonView, { value: [{ peptide: "AALTER", taxon_id: 1 }, { peptide: "MDGTEYIIVK", taxon_id: 2 }] });
        const folds = [...html.matchAll(/<details([^>]*)>/g)].map(m => m[1].includes("open"));

        expect(folds).toEqual([true, true, false]);
        expect(html).toContain(`&quot;peptide&quot;: &quot;MDGTEYIIVK&quot;, … 1 more`);
        expect(html).toMatch(/json-node__number"[^>]*>1</);
        expect(html).not.toMatch(/json-node__number"[^>]*>2</);
    });

    it("renders the first 100 items of a list, with a button for the rest", async () => {
        const html = await render(ApiJsonView, { value: Array.from({ length: 250 }, (_, i) => i) });

        expect(html.match(/json-node__number"/g)).toHaveLength(100);
        expect(html).toMatch(/Show 100 more of 150/);
    });

    it("opens everything in the open mode, and renders only the outer list's items in the closed mode", async () => {
        const value = [{ a: 1 }, { b: { c: 2 } }];
        const folds = async (mode: string) =>
            [...(await render(ApiJsonView, { value, mode })).matchAll(/<details([^>]*)>/g)].map(m => m[1].includes("open"));

        expect(await folds("open")).toEqual([true, true, true, true]);
        expect(await folds("closed")).toEqual([true, false, false]);
    });
});

describe("ApiResponseBlock", () => {
    it("asks to send the request before there is a response", async () => {
        const html = await render(ApiResponseBlock, { state: "idle" });

        expect(html).toContain("Press Try it to send this request");
        expect(html).not.toContain("api-response__body");
        expect(html).not.toContain("Expand all");
    });

    it("shows a list response with its number of items and the Expand and Collapse buttons", async () => {
        const html = await render(ApiResponseBlock, { state: "done", response: [{ taxon_id: 1 }, { taxon_id: 2 }] });

        expect(html).toContain("Response, live from the API");
        expect(html).toMatch(/api-response__count"[^>]*>2 items</);
        expect(html).toContain("Expand all");
        expect(html).toContain("Collapse all");
        expect(html).toContain("json-node");
    });

    it("counts the fields of an object and says item for a list of one", async () => {
        expect(await render(ApiResponseBlock, { state: "done", response: { id: 1, name: "Organism" } })).toMatch(/>2 fields</);
        expect(await render(ApiResponseBlock, { state: "done", response: [1] })).toMatch(/>1 item</);
    });

    it("shows a value that is not an object or list without the buttons", async () => {
        const html = await render(ApiResponseBlock, { state: "done", response: "text" });

        expect(html).not.toContain("Expand all");
        expect(html).toContain("&quot;text&quot;");
    });

    it("dims the previous response while a new one loads", async () => {
        const html = await render(ApiResponseBlock, { state: "loading", response: [1] });

        expect(html).toContain("Loading the response from the API");
        expect(html).toMatch(/class="api-response__body api-response__body--stale"/);
    });

    it("shows the error of a failed request instead of the response", async () => {
        const html = await render(ApiResponseBlock, { state: "failed", response: [1], error: "Request failed: 500" });

        expect(html).toContain("The request failed");
        expect(html).toContain("Request failed: 500");
        expect(html).not.toContain("json-node");
        expect(html).not.toContain("Expand all");
    });
});
