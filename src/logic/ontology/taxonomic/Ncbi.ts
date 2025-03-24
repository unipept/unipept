export type NcbiId = number;

export class NcbiTaxon {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly rank: string,
        public readonly lineage: NcbiId[]
    ) {}
}

export enum NcbiRank {
    Domain = "domain",
    Realm = "realm",
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
