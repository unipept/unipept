import { describe, expect, it } from "vitest";
import { apiReference } from "./apiReference";
import { createMarkdownRenderer } from "./markdown";

const md = await createMarkdownRenderer({ base: "/unipept/" });

const page = {
    layout: "api",
    parameters: [
        { name: "input[]", type: "string", required: true, summary: "Peptide to search for." },
        { name: "equate_il", type: "boolean", default: true, summary: "Equate *I* and *L*.", details: "As in the [analysis](/tpa).\n" }
    ],
    response: {
        summary: "A list of objects.\n",
        fields: [
            { name: "peptide", type: "string", summary: "The `peptide` searched for." },
            { name: "ec", type: "list of objects", summary: "EC numbers.", fields: [{ name: "ec_number", type: "string", summary: "The EC number." }] },
            { name: "<rank>_id", type: "integer", summary: "The taxon id of each rank.", when: "extra", ranks: "id" }
        ]
    },
    examples: [
        { title: "One peptide", description: "The LCA of *AALTER*.\n", params: { input: ["AALTER"] } },
        { title: "Counts", json: { counts: { 817: 3 } } }
    ]
};

const read = (frontmatter: Record<string, unknown>) => apiReference(frontmatter, md, "apidocs/pept2lca.md", { relativePath: "apidocs/pept2lca.md" });

describe("apiReference", () => {
    it("renders the Markdown texts and keeps the rest", () => {
        const api = read(page);

        expect(api.endpoint).toBe("pept2lca");
        expect(api.parameters).toEqual([
            { name: "input[]", type: "string", required: true, summary: "Peptide to search for." },
            {
                name: "equate_il", type: "boolean", default: true, summary: "Equate <em>I</em> and <em>L</em>.",
                details: `<p>As in the <a href="/unipept/tpa">analysis</a>.</p>\n`
            }
        ]);
        expect(api.response.summary).toBe("<p>A list of objects.</p>\n");
        expect(api.response.fields[0].summary).toBe("The <code v-pre>peptide</code> searched for.");
        expect(api.response.fields[1].fields).toEqual([{ name: "ec_number", type: "string", summary: "The EC number." }]);
        expect(api.examples).toEqual([
            { title: "One peptide", description: "<p>The LCA of <em>AALTER</em>.</p>\n", params: { input: ["AALTER"] } },
            { title: "Counts", json: { counts: { 817: 3 } } }
        ]);
    });

    it("lists the 28 lineage fields of a field with ranks", () => {
        const [, , lineage] = read(page).response.fields;

        expect(lineage.when).toBe("extra");
        expect(lineage.names).toHaveLength(28);
        expect(lineage.names?.slice(0, 2)).toEqual(["domain_id", "realm_id"]);
        expect(lineage.names?.at(-1)).toBe("forma_id");
    });

    it("gives a parameter with values: ranks the 28 ranks, or the values it lists", () => {
        const values = (v: unknown) =>
            read({ ...page, parameters: [...page.parameters, { name: "ranks", type: "list", summary: "x", values: v }] }).parameters[2].values;

        expect(values("ranks")).toHaveLength(28);
        expect(values("ranks")?.slice(0, 2)).toEqual(["domain", "realm"]);
        expect(values(["a", "b"])).toEqual(["a", "b"]);
        expect(() => values("taxa")).toThrow(`parameters[2].values: must be a list.`);
        expect(() => values([1])).toThrow(`parameters[2].values[0]: must be text.`);
    });

        it("rejects unknown and missing keys", () => {
        expect(() => read({ ...page, parameters: [{ name: "extra", type: "boolean", summary: "x", optional: true }] }))
            .toThrow(`parameters[0]: unknown key "optional".`);
        expect(() => read({ ...page, parameters: [{ name: "extra", summary: "x" }] }))
            .toThrow(`parameters[0]: "type" is missing.`);
        expect(() => read({ ...page, response: { fields: [{ name: "x", type: "string" }] } }))
            .toThrow(`response.fields[0]: "summary" is missing.`);
    });

    it("rejects a default that does not fit its type", () => {
        expect(() => read({ ...page, parameters: [{ name: "extra", type: "boolean", default: "no", summary: "x" }] }))
            .toThrow("parameters[0].default: must be true or false for a boolean parameter.");
    });

    it("rejects an example with a parameter the page does not list", () => {
        expect(() => read({ ...page, examples: [{ title: "x", params: { names: true } }] }))
            .toThrow(`examples[0].params: "names" is not one of the parameters.`);
    });

    it("rejects an example without a request, or with two", () => {
        expect(() => read({ ...page, examples: [{ title: "x" }] })).toThrow(`examples[0]: needs either "params" or "json".`);
        expect(() => read({ ...page, examples: [{ title: "x", params: {}, json: {} }] }))
            .toThrow(`examples[0]: needs either "params" or "json".`);
    });

    it("rejects an example with an id", () => {
        expect(() => read({ ...page, examples: [{ id: "a", title: "x", params: {} }] }))
            .toThrow(`examples[0]: unknown key "id".`);
    });
});
