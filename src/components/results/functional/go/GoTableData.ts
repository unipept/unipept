import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import CountTable from "@/logic/processors/CountTable";
import FunctionalTrust from "@/types/FunctionalTrust";

/**
 * Determines the input data that's required to visualize a GO frequency table as a Vue component.
 */
export default interface GoTableData {
    goTable: CountTable<string>;
    goTrust: FunctionalTrust;
    goToPeptides: Map<string, string[]>;

    // Presence probabilities computed by the GO-Peptonizer (one independent run per namespace, merged here);
    // undefined while computation is pending/running/failed
    goCodesToConfidence?: Map<string, number>;

    // Only required when the rows of the GO table should be expandable
    ncbiTree?: NcbiTreeNode | undefined;
    lcaToPeptides?: Map<number, string[]> | undefined;
}
