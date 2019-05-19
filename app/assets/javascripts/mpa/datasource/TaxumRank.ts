export enum TaxumRank {
    Superkingdom = "superkingdom",
    Kingdom = "kingdom",
    Subkingdom = "subkingdom",
    Superphylum = "superphylum",
    Phylum = "phylum",
    Subphylum = "subphylum",
    Superclass = "superclass",
    Class = "class",
    Subclass = "subclass",
    Infraclass = "infraclass",
    Superorder = "superorder",
    Order = "order",
    Suborder = "suborder",
    Infraorder = "infraorder",
    Parvorder = "parvorder",
    Superfamily = "superfamily",
    Family = "family",
    Subfamily = "subfamily",
    Tribe = "tribe",
    Subtribe = "subtribe",
    Genus = "genus",
    Subgenus = "subgenus",
    SpeciesGroup = "species group",
    SpeciesSubgroup = "species subgroup",
    Species = "species",
    Subspecies = "subspecies",
    Varietas = "varietas",
    Forma = "forma"
}

export function convertStringToTaxumRank(rank: string): TaxumRank {
    rank = rank.toLowerCase();
    for (let ns of Object.values(TaxumRank)) {
        if (ns === rank) {
            return ns;
        }
    }
    return null;
}