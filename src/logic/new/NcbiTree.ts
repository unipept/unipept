import {NcbiTreeNode} from "unipept-web-components";
import CountTable from "@/logic/new/CountTable";

export default class NcbiTree {
    private root: NcbiTreeNode;
    private taxa: number[] = [];
    private nodes: Map<number, NcbiTreeNode> = new Map();
    private taxaToPeptides: Map<number, Set<string>> = new Map();

    constructor(
        taxaCountTable: CountTable<number>,
        taxaOntology: number
    ) {

    }
}