import {NcbiTreeNode} from "unipept-web-components";
import CountTable from "@/logic/new/CountTable";
import FunctionalTrust from "@/types/FunctionalTrust";

/**
 * Determines the input data that's required to visualize a GO frequency table as a Vue component.
 */
export default interface GoTableData {
    goTable: CountTable<string>;
    goTrust: FunctionalTrust;
    ncbiTree: NcbiTreeNode;
    goToPeptides: Map<string, string[]>;
    lcaToPeptides: Map<number, string[]>;
}
