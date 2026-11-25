import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import type { DocsPageData, MarkdownHeader } from "virtual:docs-pages";
import { buildDocsSections } from "@/logic/docs/DocsSections";
import { docsRoutes } from "@/router/DocsRoutes";
import DocsLayout from "./DocsLayout.vue";

const header = (level: number, title: string, slug: string, children: MarkdownHeader[] = []): MarkdownHeader =>
    ({ level, title, slug, link: `#${slug}`, children });

const page = (file: string, title: string, frontmatter: Record<string, unknown> = {}, headers: MarkdownHeader[] = []): DocsPageData => ({
    file,
    title,
    frontmatter,
    headers,
    load: async () => ({ default: { render: () => h("div", { class: "vp-doc" }, `Content of ${file}`) } as never })
});

const sections = buildDocsSections(
    {
        cli: {
            title: "CLI",
            publication: "Verschaffelt et al. (2020) Bioinformatics",
            publicationLink: "doi.org/10.1093/bioinformatics/btaa553",
            menu: ["", { title: "Commands", pages: ["pept2lca", "pept2prot"] }]
        }
    },
    [
        page("cli/index.md", "Unipept CLI"),
        page(
            "cli/pept2lca.md",
            "unipept pept2lca",
            { subtitle: "Returns the lowest common ancestor.", menuLabel: "pept2lca" },
            [header(2, "Input", "input", [header(3, "Fasta", "fasta")]), header(2, "Output", "output")]
        ),
        page("cli/pept2prot.md", "unipept pept2prot")
    ]
);

async function render(path: string, clientWidth: number): Promise<string> {
    const router = createRouter({ history: createMemoryHistory(), routes: docsRoutes(sections, DocsLayout) });
    const app = createSSRApp({ render: () => h(components.VApp, () => h(RouterView)) });
    app.use(router).use(createVuetify({ components, ssr: { clientWidth } }));
    await router.push(path);
    await router.isReady();
    return renderToString(app);
}

/** The opening tags of the links to `href`, so attributes can be checked in any order. */
const links = (html: string, href: string) => html.match(new RegExp(`<a [^>]*href="${href}"[^>]*>`, "g")) ?? [];

describe("DocsLayout", () => {
    it("shows the title, subtitle and content of the page", async () => {
        const html = await render("/cli/pept2lca", 1440);

        expect(html).not.toContain("<main");
        expect(html).toMatch(/<h1 class="docs-layout__title"[^>]*>unipept pept2lca<\/h1>/);
        expect(html).toContain("Returns the lowest common ancestor.");
        expect(html).toContain("Content of cli/pept2lca.md");
        expect(html).toContain(`href="https://github.com/unipept/unipept/edit/main/src/content/docs/cli/pept2lca.md"`);
    });

    it("shows the section menu with the current page marked", async () => {
        const html = await render("/cli/pept2lca", 1440);

        expect(html).toMatch(/<nav aria-label="CLI" class="docs-side-menu"/);
        expect(html).toMatch(/<div class="docs-side-menu__group"[^>]*>Commands<\/div>/);
        const [current] = links(html, "/cli/pept2lca");
        expect(current).toContain("docs-side-menu__link--active");
        expect(current).toContain(`aria-current="page"`);
        expect(links(html, "/cli/pept2prot")[0]).not.toContain("docs-side-menu__link--active");
        expect(html).not.toContain("v-expansion-panel");
    });

    it("lists the headings under On this page", async () => {
        const html = await render("/cli/pept2lca", 1440);

        expect(html).toContain("On this page");
        expect(links(html, "/cli/pept2lca#input")[0]).toContain("docs-toc__link--level-2");
        expect(links(html, "/cli/pept2lca#fasta")[0]).toContain("docs-toc__link--level-3");
        expect(links(html, "/cli/pept2lca#output")[0]).toContain("docs-toc__link--level-2");
    });

    it("links to the previous and next page in the menu", async () => {
        const html = await render("/cli/pept2lca", 1440);

        expect(links(html, "/cli").find(link => link.includes(`rel="prev"`))).toBeDefined();
        expect(html).toMatch(/Previous<\/span> Unipept CLI/);
        expect(links(html, "/cli/pept2prot").find(link => link.includes(`rel="next"`))).toBeDefined();
        expect(html).toMatch(/Next<\/span> unipept pept2prot/);
    });

    it("shows the breadcrumb and the publication to cite", async () => {
        const html = await render("/cli/pept2lca", 1440);

        expect(html).toMatch(/<nav aria-label="Breadcrumb"[^>]*>.*CLI.*Commands.*pept2lca/s);
        expect(links(html, "/cli").length).toBeGreaterThan(0);
        expect(html).toContain(`href="https://doi.org/10.1093/bioinformatics/btaa553"`);
        expect(html).toContain("Verschaffelt et al. (2020) Bioinformatics");
    });

    it("leaves out On this page for a page without headings", async () => {
        const html = await render("/cli", 1440);

        expect(html).not.toContain("On this page");
        expect(html).not.toContain(`rel="prev"`);
    });

    it("folds the menu into a panel on a narrow screen", async () => {
        const html = await render("/cli/pept2lca", 600);

        expect(html).toContain("v-expansion-panel");
        expect(html).toContain("CLI menu");
    });
});
