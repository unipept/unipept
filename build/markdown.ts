import fs from "node:fs";
import path from "node:path";
import { normalizePath, type Plugin } from "vite";
import markdownIt, { type MarkdownIt, type Token } from "markdown-it";
import anchor from "markdown-it-anchor";
import attrs from "markdown-it-attrs";
import container from "markdown-it-container";
import { componentPlugin } from "@mdit-vue/plugin-component";
import { frontmatterPlugin } from "@mdit-vue/plugin-frontmatter";
import { resolveHeadersFromTokens, slugify } from "@mdit-vue/shared";
import { fromHighlighter } from "@shikijs/markdown-it/core";
import { createHighlighter } from "shiki";
import { apiReference } from "./apiReference.ts";

export interface MarkdownRendererOptions {
    /** Base URL of the app, added in front of absolute links and image paths. */
    base?: string;
}

export interface MarkdownPagesOptions extends MarkdownRendererOptions {
    /**
     * Folder with the docs pages. A page's URL is its path in this folder without `.md`, and `index.md` is the URL
     * of its folder. Relative links to `.md` files in these pages become absolute URLs. Link to downloads and other
     * files with an absolute path.
     */
    srcDir: string;
    /**
     * Components that pages can use without an import, as PascalCase name to module path. Pages can write the
     * tag in PascalCase or kebab-case.
     */
    components?: Record<string, string>;
    /**
     * Module path of the component that shows a page with `layout: api` in its front matter. It gets the checked
     * front matter as its `api` prop and the rendered Markdown in its default slot.
     */
    apiComponent?: string;
}

/** Languages that code blocks are highlighted in. Code in other languages is shown as plain text. */
const languages = ["shellsession", "bash", "json"];

/** Module that lists all docs pages, see {@link readDocsPages}. */
const docsPagesId = "virtual:docs-pages";
const resolvedDocsPagesId = "\0" + docsPagesId;

export interface DocsPageData {
    /** Path of the page in the docs folder, with `/` as separator. */
    file: string;
    title: string;
    frontmatter: Record<string, unknown>;
    /** The `##` and `###` headings. */
    headers: ReturnType<typeof resolveHeadersFromTokens>;
}

/** The front matter fields that the app reads from `virtual:docs-pages`. The other fields stay out of the bundle. */
const appFrontmatter = ["subtitle", "menuLabel", "layout"];

const callouts = ["tip", "info", "warning", "danger", "details"];

const kebabCase = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();


/**
 * Creates the Markdown renderer for the docs. Besides standard Markdown it supports front matter, `{#id}` after a
 * heading, `{width=50}` after an image, `::: tip`, `::: info`, `::: warning`, `::: danger`, `::: details` and `::: code-group` blocks,
 * highlighted code blocks with a header that shows the language and a copy button, and Vue components in the
 * page.
 */
export async function createMarkdownRenderer(options: MarkdownRendererOptions = {}): Promise<MarkdownIt> {
    const highlighter = await createHighlighter({
        themes: ["github-light", "github-dark"],
        langs: languages
    });

    const md = markdownIt({ html: true })
        .use(componentPlugin)
        .use(attrs, { allowedAttributes: ["id", "width"] })
        .use(anchor, { slugify, permalink: anchor.permalink.linkInsideHeader({ symbol: "&#8203;", ariaHidden: true }) })
        // gray-matter caches a file without options, also after a YAML error, which then reads as empty.
        .use(frontmatterPlugin, { grayMatterOptions: {} })
        .use(fromHighlighter(highlighter, {
            themes: { light: "github-light", dark: "github-dark" },
            defaultColor: false
        }));

    for (const name of callouts) {
        md.use(container, name, {
            render(tokens: Token[], idx: number, _options: unknown, env?: { relativePath?: string }) {
                const token = tokens[idx];
                if (token.nesting === -1) {
                    return name === "details" ? "</details>\n" : "</div>\n";
                }

                const title = md.renderInline(token.info.trim().slice(name.length).trim()
                    || (name === "details" ? "Details" : name.toUpperCase()), env);
                return name === "details"
                    ? `<details class="details custom-block"><summary>${title}</summary>\n`
                    : `<div class="${name} custom-block"><p class="custom-block-title">${title}</p>\n`;
            }
        });
    }

    md.use(container, "code-group", {
        render(tokens: Token[], idx: number, _options: unknown, env: { codeGroups?: number } = {}) {
            if (tokens[idx].nesting === -1) {
                return "</div></div>\n";
            }

            env.codeGroups = (env.codeGroups ?? 0) + 1;
            const group = `group-${env.codeGroups}`;
            let tabs = "";
            for (let i = idx + 1; tokens[i].type !== "container_code-group_close"; i++) {
                const token = tokens[i];
                if (token.type !== "fence") {
                    continue;
                }

                const first = tabs === "";
                const label = token.info.match(/\[(.*?)]/)?.[1] ?? token.info.trim().split(/\s+/)[0];
                tabs += `<input type="radio" name="${group}" id="${group}-${i}"${first ? " checked" : ""}>`
                    + `<label for="${group}-${i}">${md.utils.escapeHtml(label)}</label>`;
                if (first) {
                    token.meta = { ...token.meta, active: true };
                }
            }
            return `<div class="vp-code-group"><div class="tabs">${tabs}</div><div class="blocks">\n`;
        }
    });

    const loadedLanguages = highlighter.getLoadedLanguages();
    const languageLabels: Record<string, string> = { console: "Terminal", shellsession: "Terminal", bash: "Shell", sh: "Shell", json: "JSON" };
    const fence = md.renderer.rules.fence!;
    md.renderer.rules.fence = (tokens, idx, renderOptions, env, self) => {
        const token = tokens[idx];
        const [first = "", ...rest] = token.info.trim().split(/\s+/);
        const name = first.toLowerCase();
        const lang = md.utils.escapeHtml(name || "text");
        token.info = [loadedLanguages.includes(name) ? name : "text", ...rest].join(" ");
        const active = token.meta?.active ? " active" : "";
        const code = fence(tokens, idx, renderOptions, env, self).replace(/^<pre\b/, "<pre v-pre");
        const label = languageLabels[name] ?? (name === "text" ? "" : lang);
        return `<div class="language-${lang}${active}"><div class="code-header"><span class="lang">${label}</span>`
            + `<button type="button" class="copy">Copy</button></div>${code}</div>\n`;
    };

    const codeInline = md.renderer.rules.code_inline!;
    md.renderer.rules.code_inline = (tokens, idx, renderOptions, env, self) =>
        codeInline(tokens, idx, renderOptions, env, self).replace(/^<code\b/, "<code v-pre");

    const base = (options.base ?? "/").replace(/\/$/, "");
    const withBase = (url: string) => url.startsWith("/") && !url.startsWith("//") ? base + url : url;

    const image = md.renderer.rules.image!;
    md.renderer.rules.image = (tokens, idx, renderOptions, env, self) => {
        const token = tokens[idx];
        token.attrSet("src", withBase(String(token.attrGet("src") ?? "")));
        return image(tokens, idx, renderOptions, env, self);
    };

    md.renderer.rules.link_open = (tokens, idx, renderOptions, env, self) => {
        const token = tokens[idx];
        const href = String(token.attrGet("href") ?? "");
        if (/^[a-z][a-z\d+.-]*:/i.test(href)) {
            if (/^https?:/i.test(href)) {
                token.attrSet("target", "_blank");
                token.attrSet("rel", "noreferrer");
            }
        } else if (!href.startsWith("#")) {
            const relativePath = (env as { relativePath?: string } | undefined)?.relativePath;
            token.attrSet("href", withBase(resolveLink(href, relativePath)));
        }
        return self.renderToken(tokens, idx, renderOptions);
    };

    return md;
}

/**
 * Removes `.md` from a link, and `index.md` in favour of its folder. A relative link from a docs page, whose path in
 * the docs folder is `relativePath`, becomes an absolute URL and must stay inside the docs folder. Other relative
 * links stay relative.
 */
function resolveLink(href: string, relativePath?: string): string {
    const hashIndex = href.indexOf("#");
    const target = hashIndex < 0 ? href : href.slice(0, hashIndex);
    const hash = hashIndex < 0 ? "" : href.slice(hashIndex);
    if (!target.endsWith(".md")) {
        return href;
    }

    let url = target;
    if (relativePath && !url.startsWith("/")) {
        url = path.posix.join(path.posix.dirname(relativePath), url);
        if (url.startsWith("../")) {
            throw new Error(`${relativePath}: link ${href} points outside the docs folder.`);
        }
        url = "/" + url;
    }
    url = url.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, "");
    if (url.length > 1 && url.endsWith("/") && relativePath) {
        url = url.slice(0, -1);
    }
    return url + hash;
}

const headerOptions = {
    level: [2, 3],
    shouldAllowHtml: false,
    shouldAllowNested: false,
    shouldEscapeText: false,
    slugify
};

/**
 * Reads the title, front matter and headings of every `.md` file in `srcDir`, sorted by path. Only parses the pages,
 * so code is not highlighted. A docs page must have `title` in its front matter and no `#` heading, because the
 * docs layout shows the title.
 */
export function readDocsPages(md: MarkdownIt, srcDir: string): DocsPageData[] {
    if (!fs.existsSync(srcDir)) {
        return [];
    }

    return fs.readdirSync(srcDir, { recursive: true, encoding: "utf8" })
        .map(file => file.split(path.sep).join("/"))
        .filter(file => file.endsWith(".md"))
        .sort()
        .map(file => {
            const env: Record<string, any> = { relativePath: file };
            const tokens = md.parse(fs.readFileSync(path.join(srcDir, file), "utf8"), env);
            const frontmatter = env.frontmatter ?? {};
            if (typeof frontmatter.title !== "string") {
                throw new Error(`${file}: a docs page needs a title in its front matter.`);
            }
            if (tokens.some(token => token.tag === "h1")) {
                throw new Error(`${file}: a docs page has no # heading, because the layout shows the title.`);
            }
            return {
                file,
                title: frontmatter.title,
                frontmatter,
                headers: resolveHeadersFromTokens(tokens, headerOptions)
            };
        });
}

/**
 * Turns one Markdown page into the source of a Vue single-file component that renders the page. The page's title,
 * front matter and headings come from {@link readDocsPages} instead.
 */
export function markdownToVue(
    md: MarkdownIt,
    src: string,
    file: string,
    options: Partial<Pick<MarkdownPagesOptions, "components" | "srcDir" | "apiComponent">> = {}
): string {
    const relativePath = options.srcDir ? path.relative(options.srcDir, file).split(path.sep).join("/") : undefined;
    const env: Record<string, any> = {
        relativePath: relativePath && !relativePath.startsWith("../") ? relativePath : undefined
    };
    const html = md.render(src, env);

    const imports = Object.entries(options.components ?? {})
        .filter(([tag]) => new RegExp(`<(${tag}|${kebabCase(tag)})[\\s/>]`).test(html))
        .map(([tag, module]) => `import ${tag} from ${JSON.stringify(module)};`);

    let template = `<div class="vp-doc">${html}</div>`;
    if (env.frontmatter?.layout === "api") {
        if (!options.apiComponent) {
            throw new Error(`${file}: layout: api needs the apiComponent option.`);
        }
        const api = apiReference(env.frontmatter, md, file, env);
        imports.push(`import ApiReference from ${JSON.stringify(options.apiComponent)};`, `const api = ${JSON.stringify(api)};`);
        template = `<ApiReference :api="api">${template}</ApiReference>`;
    }

    return [
        ...(imports.length > 0 ? [`<script setup>\n${imports.join("\n")}\n</script>`] : []),
        `<template>${template}</template>`
    ].join("\n");
}

/**
 * Compiles imported `.md` files to Vue components. `@vitejs/plugin-vue` must include `.md` files to compile
 * the result.
 *
 * Also provides `virtual:docs-pages`, whose default export lists the pages in `srcDir` as {@link DocsPageData}
 * with a `load` function that imports the page.
 */
export default function markdownPages(options: MarkdownPagesOptions): Plugin {
    let renderer: Promise<MarkdownIt> | undefined;
    let root = process.cwd();
    let docsPagesCode: string | undefined;

    const docsPagesModule = async () => {
        renderer ??= createMarkdownRenderer(options);
        const md = await renderer;
        const pages = readDocsPages(md, options.srcDir).map(page => {
            const url = "/" + normalizePath(path.relative(root, path.join(options.srcDir, page.file)));
            const frontmatter = Object.fromEntries(
                Object.entries(page.frontmatter).filter(([key]) => appFrontmatter.includes(key))
            );
            return `{ ...${JSON.stringify({ ...page, frontmatter })}, load: () => import(${JSON.stringify(url)}) }`;
        });
        return `export default [\n${pages.join(",\n")}\n];\n`;
    };

    const isDocsPage = (file: string) =>
        file.endsWith(".md") && !path.relative(options.srcDir, file).startsWith("..");

    return {
        name: "unipept:markdown-pages",
        enforce: "pre",
        configResolved(config) {
            root = config.root;
        },
        resolveId(id) {
            return id === docsPagesId ? resolvedDocsPagesId : undefined;
        },
        async load(id) {
            if (id !== resolvedDocsPagesId) {
                return;
            }
            docsPagesCode = await docsPagesModule();
            return docsPagesCode;
        },
        async transform(src, id) {
            if (!id.endsWith(".md")) {
                return;
            }

            renderer ??= createMarkdownRenderer(options);
            return { code: markdownToVue(await renderer, src, id, options), map: null };
        },
        async hotUpdate({ file, modules }) {
            const index = this.environment.moduleGraph.getModuleById(resolvedDocsPagesId);
            if (!index || !isDocsPage(file) || await docsPagesModule() === docsPagesCode) {
                return;
            }
            // A title, heading or page changed, so the menus need the new list.
            this.environment.moduleGraph.invalidateModule(index);
            return [...modules, index];
        }
    };
}
