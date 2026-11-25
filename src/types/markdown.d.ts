declare module "virtual:docs-pages" {
    import type { DefineComponent } from "vue";

    export interface MarkdownHeader {
        level: number;
        title: string;
        slug: string;
        link: string;
        children: MarkdownHeader[];
    }

    export interface DocsPageData {
        /** Path of the page in `src/content/docs`, with `/` as separator. */
        file: string;
        title: string;
        frontmatter: Record<string, unknown>;
        /** The `##` and `###` headings. */
        headers: MarkdownHeader[];
        load: () => Promise<{ default: DefineComponent }>;
    }

    /** All docs pages, sorted by file. */
    const pages: DocsPageData[];
    export default pages;
}

declare module "*.md" {
    import type { DefineComponent } from "vue";

    const component: DefineComponent;
    export default component;
}
