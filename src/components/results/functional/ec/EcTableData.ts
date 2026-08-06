import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import CountTable from "@/logic/processors/CountTable";
import FunctionalTrust from "@/types/FunctionalTrust";

/**
 * Determines the input data that's required to visualize an EC frequency table as a Vue component.
 */
export default interface EcTableData {
    ecTable: CountTable<string>;
    ecTrust: FunctionalTrust;
    ecToPeptides: Map<string, string[]>;

    // Presence probabilities computed by the EC-Peptonizer; undefined while computation is pending/running/failed
    ecCodesToConfidence?: Map<string, number>;

    // Only required when the rows of the EC table should be expandable
    ncbiTree?: NcbiTreeNode | undefined;
    lcaToPeptides?: Map<number, string[]> | undefined;
}
