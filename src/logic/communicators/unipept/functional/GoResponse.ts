import {FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";

export enum GoNamespace {
    BiologicalProcess = "biological process",
    CellularComponent = "cellular component",
    MolecularFunction = "molecular function"
}

export type GoDefinition = FunctionalDefinition<GoNamespace>;
