import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { checkDocsContent } from "./content";
import { createMarkdownRenderer } from "./markdown";

const md = await createMarkdownRenderer();
const srcDir = fileURLToPath(new URL("./fixtures/docs-content", import.meta.url));

describe("checkDocsContent", () => {
    it("reports every mistake and accepts the rest", () => {
        const problems = checkDocsContent(md, srcDir, { isRoute: path => path === "/apidocs" });

        expect(problems).toEqual([
            "guide/api.md: the link #try points to an anchor that is not on the page.",
            "guide/api.md: the link /missing has no page.",
            "guide/api.md: the link #nowhere points to an anchor that is not on the page.",
            `guide/api.md: the id "parameters" is used twice.`,
            `guide/options.md: unknown front matter field "sidebar".`,
            `guide/options.md: the front matter field "menuLabel" is not text.`,
            "guide/options.md: the link /guide#missing points to an anchor that is not on guide/index.md.",
            "guide/options.md: the link /nothing has no page.",
            "guide/options.md: the link ./files/x.pdf is relative; link to a page with its .md file and to other files with an absolute path.",
            "guide/options.md: the link #nowhere points to an anchor that is not on the page.",
            "guide/options.md: the image ./images/missing.png does not exist."
        ]);
    });
});
