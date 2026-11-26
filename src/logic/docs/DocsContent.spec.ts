import { describe, expect, it } from "vitest";
import { copyableText, docsLinkTarget } from "./DocsContent";

describe("copyableText", () => {
    it("copies only the commands of a terminal session", () => {
        const session = "$ unipept pept2lca AALTER\npeptide,taxon_id\nAALTER,1\n$ cat output.txt\n";

        expect(copyableText("language-console active", session)).toBe("unipept pept2lca AALTER\ncat output.txt");
        expect(copyableText("language-shellsession", session)).toBe("unipept pept2lca AALTER\ncat output.txt");
    });

    it("copies a session without prompts whole", () => {
        expect(copyableText("language-console", "peptide,taxon_id\n")).toBe("peptide,taxon_id");
    });

    it("copies other code whole", () => {
        expect(copyableText("language-bash", "$ echo a\nb\n")).toBe("$ echo a\nb");
        expect(copyableText("language-json", "{\"a\": 1}")).toBe("{\"a\": 1}");
    });
});

describe("docsLinkTarget", () => {
    const origin = "https://unipept.ugent.be";

    it("gives the router path of a link in the app", () => {
        expect(docsLinkTarget(new URL("https://unipept.ugent.be/clidocs/pept2lca#input"), origin, "/"))
            .toBe("/clidocs/pept2lca#input");
        expect(docsLinkTarget(new URL("https://unipept.ugent.be/apidocs?a=1"), origin, "/")).toBe("/apidocs?a=1");
    });

    it("removes the base", () => {
        expect(docsLinkTarget(new URL("https://unipept.github.io/unipept/clidocs"), "https://unipept.github.io", "/unipept/"))
            .toBe("/clidocs");
        expect(docsLinkTarget(new URL("https://unipept.github.io/unipept"), "https://unipept.github.io", "/unipept/"))
            .toBe("/");
    });

    it("leaves links to other sites and outside the base to the browser", () => {
        expect(docsLinkTarget(new URL("https://github.com/unipept"), origin, "/")).toBeUndefined();
        expect(docsLinkTarget(new URL("https://unipept.github.io/other/page"), "https://unipept.github.io", "/unipept/"))
            .toBeUndefined();
        expect(docsLinkTarget(new URL("https://unipept.github.io/unipeptx"), "https://unipept.github.io", "/unipept/"))
            .toBeUndefined();
    });
});
