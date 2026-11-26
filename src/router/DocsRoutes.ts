import type { RouteComponent, RouteRecordRaw } from "vue-router";
import type { DocsPage, DocsSection } from "@/logic/docs/DocsSections";

declare module "vue-router" {
    interface RouteMeta {
        publication?: string;
        publicationLink?: string;
        /** Set on the routes of Markdown docs pages. */
        docs?: { section: DocsSection; page: DocsPage };
    }
}

/**
 * One route per section, shown in `layout`, with a child route per page. A page's URL is its path in the
 * section, and each page is loaded when it is first opened.
 */
export function docsRoutes(sections: DocsSection[], layout: RouteComponent | (() => Promise<RouteComponent>)): RouteRecordRaw[] {
    return sections.map(section => {
        const publication = { publication: section.publication, publicationLink: section.publicationLink };
        return {
            path: section.path,
            component: layout,
            meta: publication,
            children: section.pages.map(page => ({
                path: page.path.slice(section.path.length + 1),
                component: page.load,
                meta: { ...publication, docs: { section, page } }
            }))
        };
    });
}
