import {NcbiTreeNode} from "unipept-web-components";
import CountTable from "@/logic/processors/CountTable";
import FunctionalTrust from "@/types/FunctionalTrust";

/**
 * Determines the input data that's required to visualize a GO frequency table as a Vue component.
 */
export default interface GoTableData {
    goTable: CountTable<string>;
    goTrust: FunctionalTrust;
    goToPeptides: Map<string, string[]>;

    // Only required when the rows of the GO table should be expandable
    ncbiTree: NcbiTreeNode | undefined;
    lcaToPeptides: Map<number, string[]> | undefined;
}
