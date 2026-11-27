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
    { url: "/clidocs", title: "Unipept CLI documentation v4.2.2", anchors: ["functionality", "installation", "updates", "configuration"] },
    { url: "/clidocs/casestudies", title: "Unipept CLI Case Studies", anchors: [] },
    { url: "/clidocs/casestudies/tpa", title: "Case study: Taxonomic analysis of a tryptic peptide", anchors: ["fig1", "fig2", "fig3", "fig4"] },
    { url: "/clidocs/casestudies/mpa", title: "Case study: Taxonomic analysis of a metaproteomics dataset", anchors: ["fig1", "fig2", "fig3"] },
    { url: "/clidocs/uniprot", title: "uniprot", anchors: ["input", "output", "options"] },
    { url: "/clidocs/prot2pept", title: "prot2pept", anchors: ["input", "output", "fasta", "options"] },
    { url: "/clidocs/peptfilter", title: "peptfilter", anchors: ["input", "output", "fasta", "options"] },
    { url: "/clidocs/pept2lca", title: "unipept pept2lca", anchors: ["input", "output", "fasta", "options"] },
    { url: "/clidocs/pept2prot", title: "unipept pept2prot", anchors: ["input", "output", "fasta", "options"] },
    { url: "/clidocs/pept2taxa", title: "unipept pept2taxa", anchors: ["input", "output", "fasta", "options"] },
    { url: "/clidocs/pept2ec", title: "unipept pept2ec", anchors: ["input", "output", "fasta", "options"] },
    { url: "/clidocs/pept2go", title: "unipept pept2go", anchors: ["input", "output", "fasta", "options"] },
    { url: "/clidocs/pept2interpro", title: "unipept pept2interpro", anchors: ["input", "output", "fasta", "options"] },
    { url: "/clidocs/pept2funct", title: "unipept pept2funct", anchors: ["input", "output", "fasta", "options"] },
    { url: "/clidocs/peptinfo", title: "unipept peptinfo", anchors: ["input", "output", "fasta", "options"] },
    { url: "/clidocs/protinfo", title: "unipept protinfo", anchors: ["input", "output", "options"] },
    { url: "/clidocs/taxa2lca", title: "unipept taxa2lca", anchors: ["input", "output", "options"] },
    { url: "/clidocs/taxonomy", title: "unipept taxonomy", anchors: ["input", "output", "fasta", "options"] },
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
