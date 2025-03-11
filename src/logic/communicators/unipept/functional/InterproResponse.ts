import {FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";

export enum InterproNamespace {
    ActiveSite = "active site",
    BindingSite = "binding site",
    ConservedSite = "conserved site",
    Domain = "domain",
    Family = "family",
    HomologousSuperfamily = "homologous superfamily",
    PTM = "ptm",
    Repeat = "repeat",
    Unknown = "unknown"
}

export type InterproDefinition = FunctionalDefinition<InterproNamespace>;
