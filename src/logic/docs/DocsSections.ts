import type { DocsPageData, MarkdownHeader } from "virtual:docs-pages";

export interface DocsMenuGroupConfig {
    title: string;
    /** Pages in this group, see {@link DocsSectionConfig.menu}. */
    pages: string[];
}

/** Contents of the `_section.ts` file in a section folder of `src/content/docs`. */
export interface DocsSectionConfig {
    /** Name of the section, such as "CLI". */
    title: string;
    /** Publication to cite, shown at the bottom of every page in the section. */
    publication?: string;
    publicationLink?: string;
    /**
     * The menu, in order. A page is its path in the section folder without `.md`, and a folder for its `index.md`:
     * `""` for `index.md`, `"casestudies"` for `casestudies/index.md`, `"casestudies/tpa"` for `casestudies/tpa.md`.
     * Pages that are not in a group are shown above the next group, without a title.
     */
    menu: (string | DocsMenuGroupConfig)[];
}

export interface DocsPage {
    /** Path of the Markdown file in `src/content/docs`. */
    file: string;
    /** URL of the page in the app, without the base. */
    path: string;
    title: string;
    /** Name in the menu and the pager: `menuLabel` in the front matter, else the title. */
    menuLabel: string;
    subtitle?: string;
    headers: MarkdownHeader[];
    load: DocsPageData["load"];
}

export interface DocsMenuGroup {
    title?: string;
    pages: DocsPage[];
}

export interface DocsSection extends Omit<DocsSectionConfig, "menu"> {
    /** Name of the section folder, such as "clidocs". */
    name: string;
    /** URL of the section, such as "/clidocs". */
    path: string;
    menu: DocsMenuGroup[];
    /** All pages, in menu order. */
    pages: DocsPage[];
}

/** Types the default export of a `_section.ts` file. */
export function defineDocsSection(config: DocsSectionConfig): DocsSectionConfig {
    return config;
}

/**
 * URL of a page from its file in `src/content/docs`: the path without `.md`, and the folder for an `index.md`.
 * For example `clidocs/casestudies/tpa.md` is `/clidocs/casestudies/tpa` and `clidocs/index.md` is `/clidocs`.
 */
export function docsPagePath(file: string): string {
    return "/" + file.replace(/(^|\/)index\.md$/, "").replace(/\.md$/, "");
}

/**
 * Combines the section configs, by folder name, with the pages from `virtual:docs-pages`. Throws if a page is not
 * in its section's menu, if a menu entry has no page, if a page is not in a section folder with a config, or if two
 * pages have the same URL.
 */
export function buildDocsSections(configs: Record<string, DocsSectionConfig>, pages: DocsPageData[]): DocsSection[] {
    const pagesByPath = new Map<string, DocsPageData>();
    for (const page of pages) {
        const path = docsPagePath(page.file);
        const other = pagesByPath.get(path);
        if (other) {
            throw new Error(`Docs pages ${other.file} and ${page.file} both have the URL ${path}.`);
        }
        pagesByPath.set(path, page);
    }

    for (const page of pages) {
        const name = page.file.split("/")[0];
        if (!page.file.includes("/") || !(name in configs)) {
            throw new Error(`Docs page ${page.file} is not in a section folder with a _section.ts file.`);
        }
    }

    return Object.entries(configs).map(([name, { menu, ...config }]) => {
        const sectionPath = `/${name}`;
        const listed = new Set<string>();

        const toPage = (entry: string): DocsPage => {
            const path = entry === "" ? sectionPath : `${sectionPath}/${entry}`;
            const data = pagesByPath.get(path);
            if (!data) {
                throw new Error(`${name}/_section.ts: the menu entry "${entry}" has no page.`);
            }
            if (listed.has(path)) {
                throw new Error(`${name}/_section.ts: the menu has "${entry}" more than once.`);
            }
            listed.add(path);

            const { menuLabel, subtitle } = data.frontmatter;
            return {
                file: data.file,
                path,
                title: data.title,
                menuLabel: typeof menuLabel === "string" ? menuLabel : data.title,
                subtitle: typeof subtitle === "string" ? subtitle : undefined,
                headers: data.headers,
                load: data.load
            };
        };

        const groups: DocsMenuGroup[] = [];
        for (const entry of menu) {
            if (typeof entry === "string") {
                const last = groups.at(-1);
                if (last && last.title === undefined) {
                    last.pages.push(toPage(entry));
                } else {
                    groups.push({ pages: [toPage(entry)] });
                }
            } else {
                groups.push({ title: entry.title, pages: entry.pages.map(toPage) });
            }
        }

        const missing = pages.find(page => page.file.startsWith(`${name}/`) && !listed.has(docsPagePath(page.file)));
        if (missing) {
            throw new Error(`Docs page ${missing.file} is not in the menu of ${name}/_section.ts.`);
        }

        return { ...config, name, path: sectionPath, menu: groups, pages: groups.flatMap(group => group.pages) };
    });
}
