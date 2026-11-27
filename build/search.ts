import fs from "node:fs";
import path from "node:path";
import type { MarkdownIt } from "markdown-it";
import MiniSearch from "minisearch";
import type { Plugin } from "vite";
import { createMarkdownRenderer, readDocsPages, type MarkdownRendererOptions } from "./markdown.ts";
import { docsPageUrl } from "./content.ts";
import { docsSearchOptions, type DocsSearchDocument } from "../src/logic/docs/DocsSearchIndex.ts";

const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: "\"", "#39": "'", "#8203": "" };

/** The text of an HTML fragment, without tags and with single spaces. */
export function htmlText(html: string): string {
    return html
        .replace(/<\/?(p|li|ul|ol|h\d|div|pre|br|table|tr|th|td|blockquote|details|summary)\b[^>]*>/g, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/&(amp|lt|gt|quot|#39|#8203);/g, (_, name: string) => entities[name])
        .replace(/\s+/g, " ")
        .trim();
}

/** The text of Markdown in the front matter of an API page, without its markup. */
const markdownText = (text: unknown): string =>
    typeof text === "string"
        ? text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/^:::.*$/gm, " ").replace(/[`*]/g, "").replace(/\s+/g, " ").trim()
        : "";

interface ApiField {
    name?: string;
    summary?: string;
    details?: string;
    fields?: ApiField[];
}

const apiFieldsText = (fields: unknown): string =>
    (Array.isArray(fields) ? fields as ApiField[] : [])
        .map(f => [f.name, markdownText(f.summary), markdownText(f.details), apiFieldsText(f.fields)].join(" "))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

/**
 * Splits every docs page in `srcDir` at its `##` and `###` headings. The text above the first heading is a part with
 * the page title as its title. On a page with `layout: api`, the parameters and the response fields are parts too.
 */
export function docsSearchDocuments(md: MarkdownIt, srcDir: string): DocsSearchDocument[] {
    const documents: Omit<DocsSearchDocument, "id">[] = [];
    for (const page of readDocsPages(md, srcDir)) {
        const url = docsPageUrl(page.file);
        const html = md.render(fs.readFileSync(path.join(srcDir, page.file), "utf8"), { relativePath: page.file });
        const headings = [...html.matchAll(/<h([23])[^>]*\sid="([^"]*)"[^>]*>(.*?)<\/h\1>/gs)];

        const add = (anchor: string | undefined, title: string, part: string) => {
            const text = htmlText(part);
            if (text || anchor) {
                documents.push({ url: anchor ? `${url}#${anchor}` : url, page: page.title, title, text });
            }
        };

        add(undefined, page.title, html.slice(0, headings[0]?.index ?? html.length));
        headings.forEach((heading, i) => {
            const end = headings[i + 1]?.index ?? html.length;
            add(heading[2], htmlText(heading[3]), html.slice(heading.index! + heading[0].length, end));
        });

        if (page.frontmatter.layout === "api") {
            const response = page.frontmatter.response as { summary?: string; fields?: unknown } | undefined;
            documents.push(
                { url: `${url}#parameters`, page: page.title, title: "Parameters", text: apiFieldsText(page.frontmatter.parameters) },
                { url: `${url}#response`, page: page.title, title: "Response", text: `${markdownText(response?.summary)} ${apiFieldsText(response?.fields)}`.trim() }
            );
        }
    }
    return documents.map((document, id) => ({ id, ...document }));
}

/** The search index of the docs pages in `srcDir`, as JSON for `MiniSearch.loadJSON`. */
export function docsSearchIndex(md: MarkdownIt, srcDir: string): string {
    const search = new MiniSearch<DocsSearchDocument>(docsSearchOptions);
    search.addAll(docsSearchDocuments(md, srcDir));
    return JSON.stringify(search);
}

const docsSearchId = "virtual:docs-search";
const resolvedDocsSearchId = "\0" + docsSearchId;

/**
 * Provides `virtual:docs-search`, whose default export is the search index of the docs pages in `srcDir`, as JSON
 * for `MiniSearch.loadJSON` with {@link docsSearchOptions}. The index is built again when a page changes.
 */
export function docsSearch(options: MarkdownRendererOptions & { srcDir: string }): Plugin {
    let renderer: Promise<MarkdownIt> | undefined;

    return {
        name: "unipept:docs-search",
        resolveId(id) {
            return id === docsSearchId ? resolvedDocsSearchId : undefined;
        },
        async load(id) {
            if (id !== resolvedDocsSearchId) {
                return;
            }
            renderer ??= createMarkdownRenderer(options);
            return `export default ${JSON.stringify(docsSearchIndex(await renderer, options.srcDir))};\n`;
        },
        hotUpdate({ file }) {
            const index = this.environment.moduleGraph.getModuleById(resolvedDocsSearchId);
            if (index && file.endsWith(".md") && !path.relative(options.srcDir, file).startsWith("..")) {
                this.environment.moduleGraph.invalidateModule(index);
            }
        }
    };
}
