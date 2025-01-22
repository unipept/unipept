import {NcbiTreeNode} from "unipept-web-components";
import CountTable from "@/logic/new/CountTable";
import FunctionalTrust from "@/types/FunctionalTrust";

/**
 * Determines the input data that's required to visualize an EC frequency table as a Vue component.
 */
export default interface EcTableData {
    ecTable: CountTable<string>;
    ecTrust: FunctionalTrust;
    ncbiTree: NcbiTreeNode;
    ecToPeptides: Map<string, string[]>;
    lcaToPeptides: Map<string, string[]>;
}
