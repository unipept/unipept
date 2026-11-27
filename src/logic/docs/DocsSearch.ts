import MiniSearch from "minisearch";
import { docsSearchOptions, type DocsSearchDocument } from "./DocsSearchIndex";

let search: Promise<MiniSearch<DocsSearchDocument>> | undefined;

/** Loads the search index of the docs the first time it is needed. */
export function loadDocsSearch(): Promise<MiniSearch<DocsSearchDocument>> {
    search ??= import("virtual:docs-search").then(module => MiniSearch.loadJSON(module.default, docsSearchOptions));
    return search;
}
