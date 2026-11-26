import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import type { DocsPageData } from "virtual:docs-pages";
import { buildDocsSections } from "@/logic/docs/DocsSections";
import { docsRoutes } from "./DocsRoutes";

const page = (file: string): DocsPageData =>
    ({ file, title: file, frontmatter: {}, headers: [], load: async () => ({ default: {} as never }) });

const sections = buildDocsSections(
    {
        cli: {
            title: "CLI",
            publication: "Verschaffelt et al. (2020) Bioinformatics",
            publicationLink: "doi.org/10.1093/bioinformatics/btaa553",
            menu: ["", { title: "Case studies", pages: ["casestudies", "casestudies/tpa"] }]
        },
        desktop: { title: "Desktop", menu: ["", "faq"] }
    },
    [page("cli/index.md"), page("cli/casestudies/index.md"), page("cli/casestudies/tpa.md"), page("desktop/index.md"), page("desktop/faq.md")]
);

const layout = { template: "<router-view />" };

describe("docsRoutes", () => {
    it("adds a route per section with a child route per page", () => {
        const routes = docsRoutes(sections, layout);

        expect(routes.map(route => [route.path, route.children?.map(child => child.path)])).toEqual([
            ["/cli", ["", "casestudies", "casestudies/tpa"]],
            ["/desktop", ["", "faq"]]
        ]);
        expect(routes[0].component).toBe(layout);
        expect(routes[0].children?.[2].component).toBe(sections[0].pages[2].load);
    });

    it("gives every page its section, its page and the section's publication", () => {
        const router = createRouter({ history: createMemoryHistory(), routes: docsRoutes(sections, layout) });

        const tpa = router.resolve("/cli/casestudies/tpa");
        expect(tpa.matched).toHaveLength(2);
        expect(tpa.meta.docs?.section.name).toBe("cli");
        expect(tpa.meta.docs?.page.file).toBe("cli/casestudies/tpa.md");
        expect(tpa.meta.publication).toBe("Verschaffelt et al. (2020) Bioinformatics");
        expect(tpa.meta.publicationLink).toBe("doi.org/10.1093/bioinformatics/btaa553");

        expect(router.resolve("/cli").meta.docs?.page.file).toBe("cli/index.md");
        expect(router.resolve("/desktop/faq").meta.docs?.page.file).toBe("desktop/faq.md");
        expect(router.resolve("/desktop/faq").meta.publication).toBeUndefined();
        expect(router.resolve("/cli/missing").matched).toHaveLength(0);
    });
});
