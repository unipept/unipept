import NewPeptideContainer from "./NewPeptideContainer";
import {StorageType} from "./StorageType";

export default class NewDatasetManager {
    private readonly prefix: string = "mpa-";
    private readonly metaDataPrefix: string = "metadata-";
    private readonly peptidePrefix: string = "peptide-";
    private type: StorageType;
    private storage: Storage;

    public datasets: NewPeptideContainer[] = [];
    public selectedDatasets: NewPeptideContainer[] = [];

    constructor(type: StorageType = StorageType.LocalStorage) {
        this.type = type;
        if (this.type === StorageType.LocalStorage) {
            this.storage = window.localStorage;
        } else {
            this.storage = window.sessionStorage;
        }
    }

    /**
     * List all datasets that are stored in local storage memory.
     *
     * @return A list containing all datasets stored in this manager's corresponding storage type and sorted
     *         alphabetically by name.
     */
    async listDatasets(): Promise<NewPeptideContainer[]> {
        let output = [];
        for (let i = 0; i < this.storage.length; i++) {
            let key = this.storage.key(i);
            if (key.startsWith(this.metaDataPrefix)) {
                let dataset = await this.loadDataset(key.substr(this.metaDataPrefix.length));
                if (dataset) {
                    output.push(dataset)
                }
            }
        }
        return output.sort(function(a, b) {
            return a.getName() < b.getName()? -1 : 1;
        })
    }

    /**
     * Look up the given id in local storage and load all data associated with it.
     *
     * @param id The unique identifier of the data set that should be looked up.
     * @return An object containing the name, the peptides and the configuration of the dataset associated with the
     *         given name. Returns null when a dataset with the given name was not found in local storage.
     */
    async loadDataset(id: string): Promise<NewPeptideContainer | undefined> {
        let serializedData = this.storage.getItem(this.metaDataPrefix + id);
        if (serializedData != null) {
            return NewPeptideContainer.fromJSON(serializedData);
        }
        return undefined;
    }
}
