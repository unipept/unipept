import type MiniSearch from "minisearch";
import type { Options } from "minisearch";

/** One part of a docs page in the search index: the text under a `##` or `###` heading, or above the first. */
export interface DocsSearchDocument {
    id: number;
    /** URL of the part: the page, with the heading's anchor. */
    url: string;
    /** Title of the page. */
    page: string;
    /** The heading, or the page title for the text above the first heading. */
    title: string;
    text: string;
}

export type DocsSearchResult = Pick<DocsSearchDocument, "url" | "page" | "title">;

/** Options of the docs search index. The build and the browser must use the same. */
export const docsSearchOptions = {
    fields: ["title", "page", "text"],
    storeFields: ["url", "page", "title"],
    searchOptions: {
        boost: { title: 4, page: 2 },
        prefix: true,
        fuzzy: 0.2
    }
} satisfies Options<DocsSearchDocument>;

/** The parts of the docs pages that best match `query`, best first. */
export function searchDocs(index: MiniSearch<DocsSearchDocument>, query: string, limit = 20): DocsSearchResult[] {
    return index.search(query).slice(0, limit).map(({ url, page, title }) => ({ url, page, title }));
}
