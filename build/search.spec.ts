import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import MiniSearch from "minisearch";
import { createMarkdownRenderer } from "./markdown";
import { docsSearchDocuments, docsSearchIndex, htmlText } from "./search";
import { docsSearchOptions, searchDocs } from "../src/logic/docs/DocsSearchIndex";

const md = await createMarkdownRenderer();
const srcDir = fileURLToPath(new URL("./fixtures/docs-content", import.meta.url));

describe("htmlText", () => {
    it("keeps the words of inline elements together and separates blocks", () => {
        expect(htmlText("<p>The <code>taxon_id</code> &amp; <a href=\"#a\">rank</a>.</p><p>Next</p>"))
            .toBe("The taxon_id & rank. Next");
    });
});

describe("docsSearchDocuments", () => {
    it("splits the pages at their headings and adds the parameters and response of API pages", () => {
        expect(docsSearchDocuments(md, srcDir).map(({ url, title, text }) => ({ url, title, text }))).toEqual([
            { url: "/guide/api", title: "pept2lca", text: "See the response and try it." },
            { url: "/guide/api#parameters", title: "Parameters", text: "" },
            { url: "/guide/api#parameters", title: "Parameters", text: "input[] See the guide and nothing." },
            { url: "/guide/api#response", title: "Response", text: "peptide The peptide, see parameters." },
            { url: "/guide#install", title: "Install", text: "Options, the API, GitHub, install." },
            { url: "/guide/options#flags", title: "Flags", text: "Guide, nothing, file, here." }
        ]);
    });
});

describe("docsSearchIndex", () => {
    it("finds a part by a word of its heading or text", () => {
        const index = MiniSearch.loadJSON(docsSearchIndex(md, srcDir), docsSearchOptions);

        expect(searchDocs(index, "flags")[0]).toEqual({ url: "/guide/options#flags", page: "Options", title: "Flags" });
        expect(searchDocs(index, "peptide")[0].url).toBe("/guide/api#response");
        expect(searchDocs(index, "github")).toEqual([{ url: "/guide#install", page: "Guide", title: "Install" }]);
    });
});
