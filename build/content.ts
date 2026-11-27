import fs from "node:fs";
import path from "node:path";
import type { MarkdownIt } from "markdown-it";
import { apiReference } from "./apiReference.ts";
import { markdownToVue, readDocsPages, type DocsPageData } from "./markdown.ts";

export interface DocsContentOptions {
    /** Whether the app has a route or a public file for a path that is not a docs page. */
    isRoute: (path: string) => boolean;
}

const frontmatterFields = ["title", "subtitle", "menuLabel", "layout"];
/** Front matter of a page with `layout: api`, which the build checks itself. */
const apiFields = ["parameters", "response", "examples"];
/** Anchors that the API reference adds to a page with `layout: api`. */
const apiAnchors = ["parameters", "response"];

/** The HTML texts of an API reference, so their links are checked as well. */
function apiHtml(api: ReturnType<typeof apiReference>): string[] {
    const fields = (list: { summary: string; details?: string; fields?: unknown[] }[]): string[] =>
        list.flatMap(f => [f.summary, f.details ?? "", ...fields((f.fields ?? []) as typeof list)]);
    return [
        ...fields(api.parameters),
        ...fields(api.response.fields),
        api.response.summary ?? "",
        ...api.examples.map(e => e.description ?? "")
    ];
}

const pageUrl = (file: string) => "/" + file.replace(/(^|\/)index\.md$/, "").replace(/\.md$/, "");

const headerSlugs = (headers: DocsPageData["headers"]): string[] =>
    headers.flatMap(h => [h.slug, ...headerSlugs(h.children)]);

/**
 * The URL, title and anchors of every docs page in `srcDir`. The anchors are the `##` and `###` headings, and on a
 * page with `layout: api` also the anchors of the API reference.
 */
export function docsPageTargets(md: MarkdownIt, srcDir: string): { url: string; title: string; anchors: string[] }[] {
    return readDocsPages(md, srcDir).map(page => {
        const api = page.frontmatter.layout === "api" ? apiAnchors : [];
        return { url: pageUrl(page.file), title: page.title, anchors: [...headerSlugs(page.headers), ...api] };
    });
}

/**
 * Checks the docs pages in `srcDir` for mistakes that the build does not catch: unknown front matter fields, links
 * to pages or anchors that do not exist, relative links to files, missing images, and ids that a page uses twice. On API pages, the links in
 * the parameters, response fields and examples are checked too. The renderer must have `/` as base. Returns one
 * message per mistake.
 */
export function checkDocsContent(md: MarkdownIt, srcDir: string, options: DocsContentOptions): string[] {
    const pages = readDocsPages(md, srcDir).map(page => {
        const file = path.join(srcDir, page.file);
        const vue = markdownToVue(md, fs.readFileSync(file, "utf8"), file, { srcDir, apiComponent: "ApiReference" });
        let html = vue.slice(vue.indexOf("<template>"));
        const idList = [...html.matchAll(/\sid="([^"]*)"/g)].map(m => m[1]);
        if (page.frontmatter.layout === "api") {
            const api = apiReference(page.frontmatter, md, file, { relativePath: page.file });
            html += apiHtml(api).join("\n");
            idList.push(...apiAnchors);
        }
        const duplicateIds = [...new Set(idList.filter((id, i) => idList.indexOf(id) !== i))];
        return { ...page, url: pageUrl(page.file), html, ids: new Set(idList), duplicateIds };
    });
    const byUrl = new Map(pages.map(page => [page.url, page]));
    const problems: string[] = [];

    for (const page of pages) {
        const report = (message: string) => problems.push(`${page.file}: ${message}`);

        for (const [field, value] of Object.entries(page.frontmatter)) {
            if (page.frontmatter.layout === "api" && apiFields.includes(field)) {
                continue;
            }
            if (!frontmatterFields.includes(field)) {
                report(`unknown front matter field "${field}".`);
            } else if (typeof value !== "string") {
                report(`the front matter field "${field}" is not text.`);
            }
        }

        for (const [, href] of page.html.matchAll(/<a\s[^>]*href="([^"]*)"/g)) {
            if (/^[a-z][a-z\d+.-]*:/i.test(href)) {
                continue;
            }
            const [target, hash] = href.split("#");
            if (target === "") {
                if (!page.ids.has(hash)) {
                    report(`the link ${href} points to an anchor that is not on the page.`);
                }
            } else if (!target.startsWith("/")) {
                report(`the link ${href} is relative; link to a page with its .md file and to other files with an absolute path.`);
            } else if (byUrl.has(target)) {
                if (hash !== undefined && !byUrl.get(target)!.ids.has(hash)) {
                    report(`the link ${href} points to an anchor that is not on ${byUrl.get(target)!.file}.`);
                }
            } else if (!options.isRoute(target)) {
                report(`the link ${href} has no page.`);
            }
        }

        for (const [, src] of page.html.matchAll(/<img\s[^>]*src="([^"]*)"/g)) {
            if (!/^([a-z][a-z\d+.-]*:|\/)/i.test(src) && !fs.existsSync(path.join(srcDir, path.dirname(page.file), src))) {
                report(`the image ${src} does not exist.`);
            }
        }

        for (const id of page.duplicateIds) {
            report(`the id "${id}" is used twice.`);
        }
    }

    return problems;
}
