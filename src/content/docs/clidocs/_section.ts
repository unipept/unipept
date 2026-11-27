import { defineDocsSection } from "@/logic/docs/DocsSections";

export default defineDocsSection({
    title: "CLI",
    publication: "Verschaffelt et al. (2020) Bioinformatics",
    publicationLink: "doi.org/10.1093/bioinformatics/btaa553",
    description: "Run the same analyses from your terminal and in scripts.",
    startLabel: "Overview and installation",
    caseStudies: [
        { page: "casestudies/tpa", label: "Tryptic peptide analysis" },
        { page: "casestudies/mpa", label: "Metaproteomics analysis" }
    ],
    menu: [
        "",
        { title: "Case studies", pages: ["casestudies", "casestudies/tpa", "casestudies/mpa"] },
        {
            title: "Commands",
            pages: [
                "uniprot", "prot2pept", "peptfilter", "pept2lca", "pept2prot", "pept2taxa", "pept2ec", "pept2go",
                "pept2interpro", "pept2funct", "peptinfo", "protinfo", "taxa2lca", "taxonomy"
            ]
        }
    ]
});
