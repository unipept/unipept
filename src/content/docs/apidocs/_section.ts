import { defineDocsSection } from "@/logic/docs/DocsSections";

export default defineDocsSection({
    title: "API",
    publication: "Mesuere et al. (2016) Bioinformatics",
    publicationLink: "doi:10.1093/bioinformatics/btw039",
    description: "Query peptides, proteins and taxa over HTTP and get JSON back.",
    menu: [
        "",
        {
            title: "Peptides",
            pages: ["pept2prot", "pept2taxa", "pept2lca", "pept2ec", "pept2go", "pept2interpro", "pept2funct", "peptinfo"]
        },
        { title: "Proteins and taxa", pages: ["protinfo", "taxa2lca", "taxa2tree", "taxonomy"] }
    ]
});
