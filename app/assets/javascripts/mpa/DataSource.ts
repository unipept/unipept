import DataElement from "./DataElement";
import Sample from "./Sample";
import ProgressListener from "./ProgressListener";

export default abstract class DataSource {
    protected sample: Sample;
    protected progressListeners: ProgressListener[] = [];
    protected mpaConfig: MPAConfig;

    /**
     * @param sample This is the sample containing all peptides that should be considered for this DataSource.
     * @param mpaConfig A configuration that determines what search settings are used during processing of a dataset.
     */
    constructor(sample: Sample, mpaConfig: MPAConfig) {
        this.sample = sample;
        this.mpaConfig = mpaConfig;
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

    public registerProgressListener(listener: ProgressListener): void {
        this.progressListeners.push(listener);
    }
}
