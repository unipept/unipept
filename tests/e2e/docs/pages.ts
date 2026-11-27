import { fileURLToPath } from "node:url";
import { docsPageTargets } from "../../../build/content";
import { createMarkdownRenderer } from "../../../build/markdown";

/**
 * Every documentation page, with its title and the anchors that links and menus point to. The Markdown pages in
 * src/content/docs are read from their files; the .vue pages are listed here.
 */
export interface DocsPage {
    url: string;
    title: string;
    anchors: string[];
}

const markdownPages: DocsPage[] = docsPageTargets(
    await createMarkdownRenderer(),
    fileURLToPath(new URL("../../../src/content/docs", import.meta.url))
);

const vuePages: DocsPage[] = [
    { url: "/umgap", title: "UMGAP documentation", anchors: ["functionality", "installation", "updates", "configuration"] },
    { url: "/umgap/casestudies", title: "UMGAP Case Studies", anchors: [] },
    { url: "/umgap/casestudies/basic", title: "Case Study: Running a preconfigured metagenomics pipeline", anchors: [] },
    { url: "/umgap/casestudies/advanced", title: "Case Study: configuring a metagenomics pipeline", anchors: [] },
    { url: "/umgap/casestudies/comparative", title: "Case Study: Running a comparative analysis on 8 samples", anchors: [] },
    { url: "/umgap/fastq2fasta", title: "umgap fastq2fasta", anchors: ["usage"] },
    { url: "/umgap/translate", title: "umgap translate", anchors: ["usage"] },
    { url: "/umgap/prot2tryp", title: "umgap prot2tryp", anchors: ["usage"] },
    { url: "/umgap/prot2kmer", title: "umgap prot2kmer", anchors: ["usage"] },
    { url: "/umgap/filter", title: "umgap filter", anchors: ["usage"] },
    { url: "/umgap/pept2lca", title: "umgap pept2lca", anchors: ["usage"] },
    { url: "/umgap/prot2tryp2lca", title: "umgap prot2tryp2lca", anchors: ["usage"] },
    { url: "/umgap/prot2kmer2lca", title: "umgap prot2kmer2lca", anchors: ["usage"] },
    { url: "/umgap/bestof", title: "umgap bestof", anchors: ["usage"] },
    { url: "/umgap/seedextend", title: "umgap seedextend", anchors: ["usage"] },
    { url: "/umgap/uniq", title: "umgap uniq", anchors: ["usage"] },
    { url: "/umgap/taxa2agg", title: "umgap taxa2agg", anchors: ["usage"] },
    { url: "/umgap/snaptaxon", title: "umgap snaptaxon", anchors: ["usage"] },
    { url: "/umgap/taxa2freq", title: "umgap taxa2freq", anchors: ["usage"] },
    { url: "/umgap/taxa2tree", title: "umgap taxa2tree", anchors: ["usage"] },
    { url: "/umgap/taxonomy", title: "umgap taxonomy", anchors: ["usage"] },
    { url: "/umgap/splitkmers", title: "umgap splitkmers", anchors: ["usage"] },
    { url: "/umgap/joinkmers", title: "umgap joinkmers", anchors: ["usage"] },
    { url: "/umgap/buildindex", title: "umgap buildindex", anchors: ["usage"] },
    { url: "/umgap/printindex", title: "umgap printindex", anchors: ["usage"] }
];

export const docsPages: DocsPage[] = [...markdownPages, ...vuePages];
