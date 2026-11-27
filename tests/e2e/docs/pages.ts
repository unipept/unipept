import { fileURLToPath } from "node:url";
import { docsPageTargets } from "../../../build/content";
import { createMarkdownRenderer } from "../../../build/markdown";

/** A documentation page, with its title and the anchors that links and menus point to. */
export interface DocsPage {
    url: string;
    title: string;
    anchors: string[];
}

/** Every documentation page, read from the Markdown files in src/content/docs. */
export const docsPages: DocsPage[] = docsPageTargets(
    await createMarkdownRenderer(),
    fileURLToPath(new URL("../../../src/content/docs", import.meta.url))
);
