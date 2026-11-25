import fs from "node:fs";
import path from "node:path";
import { normalizePath, type Plugin } from "vite";
import markdownIt, { type MarkdownIt, type Token } from "markdown-it";
import anchor from "markdown-it-anchor";
import attrs from "markdown-it-attrs";
import container from "markdown-it-container";
import { componentPlugin } from "@mdit-vue/plugin-component";
import { frontmatterPlugin } from "@mdit-vue/plugin-frontmatter";
import { headersPlugin } from "@mdit-vue/plugin-headers";
import { sfcPlugin } from "@mdit-vue/plugin-sfc";
import { titlePlugin } from "@mdit-vue/plugin-title";
import { resolveHeadersFromTokens, slugify } from "@mdit-vue/shared";
import { fromHighlighter } from "@shikijs/markdown-it/core";
import { createHighlighter } from "shiki";

export interface MarkdownRendererOptions {
    /** Base URL of the app, added in front of absolute links and image paths. */
    base?: string;
    /** Languages that code blocks can be highlighted in. Other languages are shown as plain text. */
    languages?: string[];
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
}

export const defaultLanguages = ["shellsession", "bash", "json"];

/** Module that lists all docs pages, see {@link readDocsPages}. */
export const docsPagesId = "virtual:docs-pages";
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
const appFrontmatter = ["subtitle", "menuLabel"];

const callouts = ["tip", "info", "warning", "danger", "details"];

const kebabCase = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const scriptSetupRE = /^<script\b[^>]*\bsetup\b[^>]*>/;
const scriptLangTsRE = /^<script\b[^>]*\blang=["']ts["']/;

/**
 * Creates the Markdown renderer for the docs. Besides standard Markdown it supports front matter, `{#id}` after a
 * heading, `::: tip`, `::: info`, `::: warning`, `::: danger`, `::: details` and `::: code-group` blocks,
 * highlighted code blocks with a copy button, and Vue components and `<script setup>` in the page.
 */
export async function createMarkdownRenderer(options: MarkdownRendererOptions = {}): Promise<MarkdownIt> {
    const highlighter = await createHighlighter({
        themes: ["github-light", "github-dark"],
        langs: options.languages ?? defaultLanguages
    });

    const md = markdownIt({ html: true })
        .use(componentPlugin)
        .use(attrs, { allowedAttributes: ["id"] })
        .use(anchor, { slugify, permalink: anchor.permalink.linkInsideHeader({ symbol: "&#8203;", ariaHidden: true }) })
        .use(frontmatterPlugin)
        .use(headersPlugin, { level: [2, 3] })
        .use(sfcPlugin)
        .use(titlePlugin)
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

                // A separate env, so rendering the title does not reset the page's headers and title.
                const titleEnv = { relativePath: env?.relativePath };
                const title = md.renderInline(token.info.trim().slice(name.length).trim()
                    || (name === "details" ? "Details" : name.toUpperCase()), titleEnv);
                return name === "details"
                    ? `<details class="details custom-block"><summary>${title}</summary>\n`
                    : `<div class="${name} custom-block"><p class="custom-block-title">${title}</p>\n`;
            }
        });
    }

    md.use(container, "code-group", {
        render(tokens: Token[], idx: number) {
            if (tokens[idx].nesting === -1) {
                return "</div></div>\n";
            }

            const group = `group-${idx}`;
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
    const fence = md.renderer.rules.fence!;
    md.renderer.rules.fence = (tokens, idx, renderOptions, env, self) => {
        const token = tokens[idx];
        const [first = "", ...rest] = token.info.trim().split(/\s+/);
        const name = first.toLowerCase();
        const lang = md.utils.escapeHtml(name || "text");
        token.info = [loadedLanguages.includes(name) ? name : "text", ...rest].join(" ");
        const active = token.meta?.active ? " active" : "";
        const code = fence(tokens, idx, renderOptions, env, self).replace(/^<pre\b/, "<pre v-pre");
        return `<div class="language-${lang}${active}"><button title="Copy code" class="copy"></button>`
            + `<span class="lang">${lang}</span>${code}</div>\n`;
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
 * Turns one Markdown page into the source of a Vue single-file component. The component renders the page and
 * exports its `frontmatter`, `headers` and `title`. The title is `title` in the front matter, else the first `#`
 * heading.
 */
export function markdownToVue(
    md: MarkdownIt,
    src: string,
    file: string,
    options: Partial<Pick<MarkdownPagesOptions, "components" | "srcDir">> = {}
): string {
    const relativePath = options.srcDir ? path.relative(options.srcDir, file).split(path.sep).join("/") : undefined;
    const env: Record<string, any> = {
        relativePath: relativePath && !relativePath.startsWith("../") ? relativePath : undefined
    };
    const html = md.render(src, env);

    const scripts: string[] = env.sfcBlocks?.scripts.map((s: { content: string }) => s.content) ?? [];
    const setupIndex = scripts.findIndex(s => scriptSetupRE.test(s));
    if (scripts.some(s => !scriptSetupRE.test(s))) {
        throw new Error(`${file}: use <script setup> in Markdown pages, not <script>.`);
    }
    const lang = scripts.some(s => scriptLangTsRE.test(s)) ? ` lang="ts"` : "";

    const imports = Object.entries(options.components ?? {})
        .filter(([tag]) => new RegExp(`<(${tag}|${kebabCase(tag)})[\\s/>]`).test(html))
        .map(([tag, module]) => `import ${tag} from ${JSON.stringify(module)};`);
    if (imports.length > 0) {
        if (setupIndex >= 0) {
            scripts[setupIndex] = scripts[setupIndex].replace(scriptSetupRE, open => `${open}\n${imports.join("\n")}`);
        } else {
            scripts.push(`<script setup${lang}>\n${imports.join("\n")}\n</script>`);
        }
    }

    const pageData = [
        `export const frontmatter = ${JSON.stringify(env.frontmatter ?? {})};`,
        `export const headers = ${JSON.stringify(env.headers ?? [])};`,
        `export const title = ${JSON.stringify(typeof env.frontmatter?.title === "string" ? env.frontmatter.title : env.title ?? "")};`
    ];

    return [
        `<script${lang}>\n${pageData.join("\n")}\n</script>`,
        ...scripts,
        `<template><div class="vp-doc">${html}</div></template>`,
        ...(env.sfcBlocks?.styles.map((s: { content: string }) => s.content) ?? []),
        ...(env.sfcBlocks?.customBlocks.map((s: { content: string }) => s.content) ?? [])
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
