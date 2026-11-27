import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createMemoryHistory, createRouter } from "vue-router";
import { checkDocsContent } from "../../../build/content";
import { createMarkdownRenderer } from "../../../build/markdown";
import { routes } from "@/router/routes";

describe("the docs content in src/content/docs", () => {
    it("has no broken links, unknown front matter fields or missing images", async () => {
        const router = createRouter({ history: createMemoryHistory(), routes });
        const publicDir = fileURLToPath(new URL("../../../public", import.meta.url));
        const problems = checkDocsContent(
            await createMarkdownRenderer(),
            fileURLToPath(new URL("../../../src/content/docs", import.meta.url)),
            { isRoute: path => router.resolve(path).matched.length > 0 || fs.existsSync(publicDir + path) }
        );

        expect(problems).toEqual([]);
    });
});
