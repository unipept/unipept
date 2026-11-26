import { describe, expect, it } from "vitest";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { compileTemplate, parse } from "vue/compiler-sfc";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { ResolvedConfig } from "vite";
import markdownPages, { createMarkdownRenderer, markdownToVue, readDocsPages } from "./markdown";
import Sample from "./fixtures/sample.md";

const md = await createMarkdownRenderer({ base: "/unipept/" });
const components = { ApiExample: "@/components/ApiExample.vue", ApiTry: "@/components/ApiTry.vue" };

const render = (src: string) => parse(markdownToVue(md, src, "/docs/a.md")).descriptor.template!.content;

describe("markdownToVue", () => {
    it("produces a single-file component without errors", () => {
        const { descriptor, errors } = parse(markdownToVue(md, "# Title\n\n## Section {#section}\n", "/docs/a.md"));

        expect(errors).toEqual([]);
        expect(descriptor.template?.content).toContain(`<h2 id="section"`);
        expect(descriptor.script).toBeNull();
        expect(descriptor.scriptSetup).toBeNull();
    });

    it("imports only the components a page uses", () => {
        const vue = markdownToVue(md, `<ApiExample endpoint="pept2lca" />\n`, "/docs/a.md", { components });

        expect(parse(vue).descriptor.scriptSetup?.content).toContain(`import ApiExample from "@/components/ApiExample.vue";`);
        expect(vue).not.toContain("ApiTry");
    });

    it("finds a component written in kebab-case", () => {
        const vue = markdownToVue(md, `<api-example endpoint="pept2lca" />\n`, "/docs/a.md", { components });

        expect(vue).toContain(`import ApiExample from "@/components/ApiExample.vue";`);
    });

    it("does not import a component whose name is only a prefix of the tag", () => {
        const vue = markdownToVue(md, `<ApiExampleList />\n<api-example-list />\n`, "/docs/a.md", { components });

        expect(vue).not.toContain("import ApiExample");
    });

    it("does not compile a page with a script block", () => {
        const template = render("<script>\nconst a = 1;\n</script>\n");

        expect(compileTemplate({ source: template, filename: "a.md", id: "a" }).errors).not.toEqual([]);
    });
});

describe("createMarkdownRenderer", () => {
    it("gives duplicate headings unique anchors", () => {
        const html = render("## Same\n\n## Same\n");

        expect(html).toContain(`<h2 id="same"`);
        expect(html).toContain(`<h2 id="same-1"`);
    });

    it("renders details blocks", () => {
        expect(render("::: details More\nHidden.\n:::\n"))
            .toContain(`<details class="details custom-block"><summary>More</summary>`);
    });

    it("rewrites links to Markdown pages and adds the base to absolute links", () => {
        const html = render("[a](./b.md#c) [d](./index.md) [e](/apidocs/pept2lca.md) [f](#g)\n");

        expect(html).toContain(`<a href="./b#c">`);
        expect(html).toContain(`<a href="./">`);
        expect(html).toContain(`<a href="/unipept/apidocs/pept2lca">`);
        expect(html).toContain(`<a href="#g">`);
    });

    it("resolves relative links from a docs page against the page's file", () => {
        const link = (file: string, href: string) =>
            markdownToVue(md, `[x](${href})\n`, file, { srcDir: "/docs" }).match(/<a href="([^"]*)"/)?.[1];

        expect(link("/docs/clidocs/index.md", "./pept2lca.md")).toBe("/unipept/clidocs/pept2lca");
        expect(link("/docs/clidocs/index.md", "./casestudies/index.md#mpa")).toBe("/unipept/clidocs/casestudies#mpa");
        expect(link("/docs/clidocs/casestudies/tpa.md", "./mpa.md")).toBe("/unipept/clidocs/casestudies/mpa");
        expect(link("/docs/clidocs/casestudies/tpa.md", "../index.md#input")).toBe("/unipept/clidocs#input");
        expect(link("/docs/clidocs/pept2lca.md", "./images/a.png")).toBe("./images/a.png");
        expect(link("/elsewhere/a.md", "./b.md")).toBe("./b");
    });

    it("resolves links in a callout title like links in the body", () => {
        const vue = markdownToVue(md, "::: tip See [b](./b.md)\nSee [b](./b.md).\n:::\n", "/docs/clidocs/index.md", { srcDir: "/docs" });

        expect(vue.match(/<a href="[^"]*"/g)).toEqual([`<a href="/unipept/clidocs/b"`, `<a href="/unipept/clidocs/b"`]);
    });

    it("rejects a relative link that leaves the docs folder", () => {
        expect(() => markdownToVue(md, "[out](../../outside.md)\n", "/docs/clidocs/a.md", { srcDir: "/docs" }))
            .toThrow("clidocs/a.md: link ../../outside.md points outside the docs folder.");
    });

    it("adds the base to absolute image paths", () => {
        const html = render("![a](/images/a.png) ![b](./b.png) ![c](https://example.org/c.png)\n");

        expect(html).toContain(`<img src="/unipept/images/a.png" alt="a">`);
        expect(html).toContain(`<img src="./b.png" alt="b">`);
        expect(html).toContain(`<img src="https://example.org/c.png" alt="c">`);
    });

    it("opens external links in a new tab", () => {
        expect(render("[Unipept](https://unipept.ugent.be)\n"))
            .toContain(`<a href="https://unipept.ugent.be" target="_blank" rel="noreferrer">`);
    });

    it("does not interpolate inline code", () => {
        expect(render("Write `{{ peptide }}` here.\n")).toContain(`<code v-pre>{{ peptide }}</code>`);
    });

    it("keeps an interpolation at the end of a paragraph", () => {
        expect(render("The peptide is {{ peptide }}\n")).toContain("The peptide is {{ peptide }}");
    });

    it("gives headings without an id the same anchors as VitePress", () => {
        expect(render("## pept2lca (taxon) & more?\n")).toContain(`<h2 id="pept2lca-taxon-more"`);
        expect(render("## The `{{ x }}` option\n")).toContain(`<h2 id="the-x-option"`);
    });

    it("highlights a language whatever its case", () => {
        const html = render("```JSON\n{\"a\": 1}\n```\n");

        expect(html).toContain(`<div class="language-json">`);
        expect(html).toMatch(/<span style="--shiki-light:#[0-9A-F]{6}/i);
    });

    it("shows code in an unknown language as plain text", () => {
        const html = render("```nope\nplain\n```\n");

        expect(html).toContain(`<div class="language-nope">`);
        expect(html).toContain("plain");
    });
});

describe("a Markdown page imported through Vite", () => {
    it("renders the blocks", async () => {
        const html = await renderToString(createSSRApp(Sample));

        expect(html).toContain("The command reads peptides");
        expect(html).toContain(`<a href="./pept2prot">pept2prot</a>`);
        expect(html).toContain(`<div class="tip custom-block"><p class="custom-block-title">Input size</p>`);
        expect(html).toContain(`<div class="vp-code-group">`);
        expect(html).toContain("{{ not interpolated }}");
        expect(html).toContain(`<div class="language-console active"><div class="code-header"><span class="lang">Terminal</span>`
            + `<button type="button" class="copy">Copy</button></div>`);
        expect(html).toMatch(/<span style="--shiki-light:#[0-9A-F]{6}/i);
        expect(html).toMatch(/<img src="[^"]*pixel\.png" alt="A pixel"/);
    });
});

describe("readDocsPages", () => {
    const srcDir = fileURLToPath(new URL("./fixtures/docs", import.meta.url));

    it("lists the title, front matter and headings of every page", () => {
        expect(readDocsPages(md, srcDir)).toEqual([
            { file: "guide/advanced/options.md", title: "Options", frontmatter: { title: "Options" }, headers: [] },
            {
                file: "guide/index.md",
                title: "Guide",
                frontmatter: { title: "Guide", subtitle: "Start here." },
                headers: [
                    {
                        level: 2, title: "Install", slug: "install", link: "#install",
                        children: [{ level: 3, title: "macOS", slug: "macos_installation", link: "#macos_installation", children: [] }]
                    },
                    { level: 2, title: "Use it", slug: "use-it", link: "#use-it", children: [] }
                ]
            }
        ]);
    });

    it("lists headings whose anchors are on the compiled page", () => {
        const [, page] = readDocsPages(md, srcDir);
        const vue = markdownToVue(md, readFileSync(`${srcDir}/guide/index.md`, "utf8"), `${srcDir}/guide/index.md`, { srcDir });
        const slugs = page.headers.flatMap(h => [h.slug, ...h.children.map(c => c.slug)]);

        expect(slugs).toEqual(["install", "macos_installation", "use-it"]);
        slugs.forEach(slug => expect(vue).toContain(`id="${slug}"`));
    });

    it("provides the pages as virtual:docs-pages, with a function that imports each page", async () => {
        const plugin = markdownPages({ srcDir });
        (plugin.configResolved as (config: Partial<ResolvedConfig>) => void)({ root: fileURLToPath(new URL("..", import.meta.url)) });
        const id = (plugin.resolveId as (id: string) => string)("virtual:docs-pages");
        const code = await (plugin.load as (id: string) => Promise<string>)(id);

        expect(code).toContain(`load: () => import("/build/fixtures/docs/guide/advanced/options.md")`);
        expect(code).toContain(`"file":"guide/index.md","title":"Guide","frontmatter":{"subtitle":"Start here."}`);
    });

    it("rejects a page without a title in its front matter", () => {
        expect(() => readDocsPages(md, fileURLToPath(new URL("./fixtures/docs-errors/no-title", import.meta.url))))
            .toThrow("page.md: a docs page needs a title in its front matter.");
    });

    it("rejects a page with a # heading", () => {
        expect(() => readDocsPages(md, fileURLToPath(new URL("./fixtures/docs-errors/heading", import.meta.url))))
            .toThrow("page.md: a docs page has no # heading, because the layout shows the title.");
    });

    it("returns no pages if the folder does not exist", () => {
        expect(readDocsPages(md, `${srcDir}/missing`)).toEqual([]);
    });
});
