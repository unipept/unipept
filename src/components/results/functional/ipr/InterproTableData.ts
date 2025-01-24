import {NcbiTreeNode} from "unipept-web-components";
import CountTable from "@/logic/processors/CountTable";
import FunctionalTrust from "@/types/FunctionalTrust";

/**
 * Determines the input data that's required to visualize an Interpro frequency table as a Vue component.
 */
export default interface InterproTableData {
    iprTable: CountTable<string>;
    iprTrust: FunctionalTrust;
    iprToPeptides: Map<string, string[]>;

    // Only required when the rows of the Interpro table should be expandable
    ncbiTree: NcbiTreeNode | undefined;
    lcaToPeptides: Map<number, string[]> | undefined;
}