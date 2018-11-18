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
}
