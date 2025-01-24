import {NcbiTreeNode} from "unipept-web-components";
import CountTable from "@/logic/processors/CountTable";
import FunctionalTrust from "@/types/FunctionalTrust";

/**
 * Determines the input data that's required to visualize an EC frequency table as a Vue component.
 */
export default interface EcTableData {
    ecTable: CountTable<string>;
    ecTrust: FunctionalTrust;
    ecToPeptides: Map<string, string[]>;

    // Only required when the rows of the EC table should be expandable
    ncbiTree: NcbiTreeNode | undefined;
    lcaToPeptides: Map<number, string[]> | undefined;
}
