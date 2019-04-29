import DataElement from "./DataElement";
import Sample from "./Sample";
import ProgressListener from "./ProgressListener";
import DataRepository from "./DataRepository";

export default abstract class DataSource {
    protected _repository: DataRepository;

    /**
     * Construct a new DataSource. This is typically done by calling the appropriate construct function on the
     * DataRepository class.
     * 
     * @see DataRepository
     * 
     * @param repository The DataRepository that's used to retrieve data from in this DataSource.
     */
    constructor(repository: DataRepository) {
        this._repository = repository;
    }

    /**
     * Get the n most popular items from this DataSource. The popularity is based on the amount of peptides that
     * associated with a particular DataElement.
     * 
     * @param n The amount of items that should be listed. If n is larger than the amount of available items in this
     * DataSource, all items will be returned. The returned list is sorted on the amount of peptides associated with 
     * each item.
     */
    public abstract async getTopItems(n: number): Promise<DataElement[]>;
}
