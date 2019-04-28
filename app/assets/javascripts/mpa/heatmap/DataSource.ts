import DataElement from "./DataElement";

export default interface DataSource {
    /**
     * Get the n most popular items from this datasource. The popularity is based on the amount of peptides that
     * associated with a particular DataElement.
     * 
     * @param n The amount of items that should be listed. If n is larger than the amount of available items in this
     * datasource, all items will be returned. The returned list is sorted on the amount of peptides associated with 
     * each item.
     */
    getTopItems(n: number): DataElement[];
}
