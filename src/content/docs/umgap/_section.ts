import { defineDocsSection } from "@/logic/docs/DocsSections";

export default defineDocsSection({
    title: "UMGAP",
    publication: "Gurdeep Singh et al. (2019) Journal of Proteome Research",
    publicationLink: "doi:10.1021/acs.jproteome.8b00716",
    description: "Analyse metagenomics reads, from FASTQ files to taxonomic profiles.",
    startLabel: "Overview and installation",
    caseStudies: ["casestudies/basic", "casestudies/advanced", "casestudies/comparative"],
    menu: [
        "",
        { title: "Case studies", pages: ["casestudies", "casestudies/basic", "casestudies/advanced", "casestudies/comparative"] },
        {
            title: "Commands",
            pages: [
                "fastq2fasta", "translate", "prot2tryp", "prot2kmer", "filter", "pept2lca", "prot2tryp2lca", "prot2kmer2lca",
                "bestof", "seedextend", "uniq", "taxa2agg", "snaptaxon", "taxa2freq", "taxa2tree", "taxonomy", "splitkmers",
                "joinkmers", "buildindex", "printindex"
            ]
        }
    ]
});
