export type NcbiId = number;

export class NcbiTaxon {
    constructor(
        public readonly id: NcbiId,
        public readonly name: string,
        public readonly rank: string,
        public readonly lineage: NcbiId[]
    ) {}
}

export enum NcbiRank {
    Superkingdom = "superkingdom",
    Kingdom = "kingdom",
    Subkingdom = "subkingdom",
    Superphylum = "superphylum",
    Phylum = "phylum",
    Subphylum = "subphylum",
    Superclass = "superclass",
    Class = "class",
    Subclass = "subclass",
    Superorder = "superorder",
    Order = "order",
    Suborder = "suborder",
    Infraorder = "infraorder",
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
    Strain = "strain",
    Varietas = "varietas",
    Forma = "forma"
}
