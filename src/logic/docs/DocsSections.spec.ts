import { describe, expect, it } from "vitest";
import type { DocsPageData } from "virtual:docs-pages";
import { adjacentDocsPages, buildDocsSections, docsPagePath, docsSectionConfigs, type DocsSectionConfig } from "./DocsSections";

const load = async () => ({ default: {} as never });

const page = (file: string, title: string, frontmatter: Record<string, unknown> = {}): DocsPageData =>
    ({ file, title, frontmatter, headers: [], load });

const pages = [
    page("cli/casestudies/index.md", "Case studies"),
    page("cli/casestudies/tpa.md", "Tryptic peptide analysis", { menuLabel: "Tryptic peptide" }),
    page("cli/index.md", "Unipept CLI", { subtitle: "Command line tools." }),
    page("cli/pept2lca.md", "unipept pept2lca")
];

const config: DocsSectionConfig = {
    title: "CLI",
    publication: "Verschaffelt et al. (2020) Bioinformatics",
    publicationLink: "doi.org/10.1093/bioinformatics/btaa553",
    menu: [
        "",
        { title: "Case studies", pages: ["casestudies", "casestudies/tpa"] },
        { title: "Commands", pages: ["pept2lca"] }
    ]
};

describe("docsPagePath", () => {
    it("drops .md, and index.md in favour of its folder", () => {
        expect(docsPagePath("cli/index.md")).toBe("/cli");
        expect(docsPagePath("cli/pept2lca.md")).toBe("/cli/pept2lca");
        expect(docsPagePath("cli/casestudies/index.md")).toBe("/cli/casestudies");
        expect(docsPagePath("cli/casestudies/tpa.md")).toBe("/cli/casestudies/tpa");
    });
});

describe("buildDocsSections", () => {
    it("builds the menu in the order of the config", () => {
        const [section] = buildDocsSections({ cli: config }, pages);

        expect(section.name).toBe("cli");
        expect(section.path).toBe("/cli");
        expect(section.title).toBe("CLI");
        expect(section.publication).toBe(config.publication);
        expect(section.menu.map(group => [group.title, group.pages.map(p => p.path)])).toEqual([
            [undefined, ["/cli"]],
            ["Case studies", ["/cli/casestudies", "/cli/casestudies/tpa"]],
            ["Commands", ["/cli/pept2lca"]]
        ]);
        expect(section.pages.map(p => p.path))
            .toEqual(["/cli", "/cli/casestudies", "/cli/casestudies/tpa", "/cli/pept2lca"]);
    });

    it("takes the menu label and subtitle from the front matter", () => {
        const [section] = buildDocsSections({ cli: config }, pages);
        const [overview, , tpa, pept2lca] = section.pages;

        expect(overview).toMatchObject({ file: "cli/index.md", title: "Unipept CLI", subtitle: "Command line tools." });
        expect(tpa).toMatchObject({ title: "Tryptic peptide analysis", menuLabel: "Tryptic peptide" });
        expect(pept2lca).toMatchObject({ menuLabel: "unipept pept2lca", subtitle: undefined, load });
    });

    it("puts pages outside a group together until the next group", () => {
        const [section] = buildDocsSections(
            { cli: { title: "CLI", menu: ["", "pept2lca", { title: "Case studies", pages: ["casestudies"] }, "casestudies/tpa"] } },
            pages
        );

        expect(section.menu.map(group => [group.title, group.pages.length]))
            .toEqual([[undefined, 2], ["Case studies", 1], [undefined, 1]]);
    });

    it("returns no sections without configs and pages", () => {
        expect(buildDocsSections({}, [])).toEqual([]);
    });

    it("rejects a page that is not in the menu", () => {
        expect(() => buildDocsSections({ cli: { title: "CLI", menu: ["", "casestudies", "casestudies/tpa"] } }, pages))
            .toThrow("Docs page cli/pept2lca.md is not in the menu of cli/_section.ts.");
    });

    it("rejects a menu entry without a page", () => {
        expect(() => buildDocsSections({ cli: { ...config, menu: [...config.menu, "pept2prot"] } }, pages))
            .toThrow(`cli/_section.ts: the menu entry "pept2prot" has no page.`);
    });

    it("rejects a page that is in the menu twice", () => {
        expect(() => buildDocsSections({ cli: { ...config, menu: [...config.menu, "pept2lca"] } }, pages))
            .toThrow(`cli/_section.ts: the menu has "pept2lca" more than once.`);
    });

    it("rejects two pages with the same URL", () => {
        expect(() => buildDocsSections({ cli: config }, [...pages, page("cli/pept2lca/index.md", "unipept pept2lca")]))
            .toThrow("Docs pages cli/pept2lca.md and cli/pept2lca/index.md both have the URL /cli/pept2lca.");
    });

    it("rejects a page outside a section with a config", () => {
        expect(() => buildDocsSections({ cli: config }, [...pages, page("umgap/index.md", "UMGAP")]))
            .toThrow("Docs page umgap/index.md is not in a section folder with a _section.ts file.");
        expect(() => buildDocsSections({}, [page("index.md", "Docs")]))
            .toThrow("Docs page index.md is not in a section folder with a _section.ts file.");
    });
});

describe("docsSectionConfigs", () => {
    it("keys the configs by section folder", () => {
        expect(docsSectionConfigs({ "/src/content/docs/cli/_section.ts": config })).toEqual({ cli: config });
    });
});

describe("adjacentDocsPages", () => {
    const [section] = buildDocsSections({ cli: config }, pages);
    const [overview, casestudies, , pept2lca] = section.pages;

    it("gives the pages before and after a page, across groups", () => {
        expect(adjacentDocsPages(section, casestudies)).toEqual({ previous: overview, next: section.pages[2] });
    });

    it("gives no previous page for the first page and no next page for the last", () => {
        expect(adjacentDocsPages(section, overview).previous).toBeUndefined();
        expect(adjacentDocsPages(section, pept2lca).next).toBeUndefined();
    });
});
