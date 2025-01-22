import {NcbiTreeNode} from "unipept-web-components";
import CountTable from "@/logic/new/CountTable";
import FunctionalTrust from "@/types/FunctionalTrust";

/**
 * Determines the input data that's required to visualize an Interpro frequency table as a Vue component.
 */
export default interface InterproTableData {
    iprTable: CountTable<string>;
    iprTrust: FunctionalTrust;
    ncbiTree: NcbiTreeNode;
    iprToPeptides: Map<string, string[]>;
    lcaToPeptides: Map<string, string[]>;
}