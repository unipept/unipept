import NewDatasetManager from "./NewDatasetManager";
import {StorageType} from "./StorageType";

export default class NewPeptideContainer {
    private id: string;
    private peptides: string[];
    private name: string;
    private peptideAmount: number;
    private date: Date;
    private type: StorageType;

    /**
     * Create a new PeptideContainer from a given JSON-representation of a valid container.
     *
     * @param metaData JSON-representation of the metadata that's associated with the given list of peptides.
     * @param peptideData JSON-representation of the list of peptides that's associated with the given metadata.
     * @return A PeptideContainer that's the living counterpart of the given JSON-string.
     */
    static fromJSON(metaData: string, peptideData?: string) {
        let meta = JSON.parse(metaData);
        let splitDate = meta.date.split("/");
        let output = new NewPeptideContainer(meta.id, meta.name, meta.amount, new Date(splitDate[0], splitDate[1] - 1, splitDate[2]), meta.type);
        if (peptideData !== undefined) {
            let peptides = JSON.parse(peptideData);
            output.setPeptides(peptides);
        }
        return output;
    }

    /**
     * Create a new PeptideContainer. A PeptideContainer is actually a representation of a dataset that can be
     * serialized to local storage.
     *
     * @param id The unique id of the stored dataset.
     * @param name The name of the stored dataset.
     * @param peptideAmount The amount of peptides that are to be stored in this container.
     * @param date The date at which the dataset was first created.
     * @param type One of "local_storage" and "session_storage"
     */
    constructor(id: string, name: string, peptideAmount: number, date: Date, type: StorageType) {
        this.id = id;
        this.peptides = undefined;
        this.name = name;
        this.peptideAmount = peptideAmount;
        this.date = date;
        this.type = type;
        this.peptides = null;
    }

    setPeptides(peptides: string[]) {
        this.peptides = peptides;
    }

    /**
     * @returns The peptides that are stored in this container.
     */
    async getPeptides(): Promise<string[]> {
        if (this.peptides === undefined) {
            let dataSetManager = new NewDatasetManager(this.type);
            //this.peptides = await dataSetManager.loadPeptides(this.id);
        }

        return this.peptides;
    }

    getAmountOfPeptides(): number {
        return this.peptideAmount;
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getDateFormatted(): string {
        return this.date.getFullYear() + "/" + (this.date.getMonth() + 1) + "/" + this.date.getDate();
    }

    getType(): StorageType {
        return this.type;
    }

    getMetadataJSON() {
        return {
            id: this.id,
            name: this.name,
            amount: this.peptideAmount,
            date: this.getDateFormatted(),
            type: this.type
        };
    }

    getDataJSON() {
        return {
            peptides: this.peptides
        };
    }

    /**
     * @return JSON representation of this object
     */
    toJSON() {
        return {
            id: this.id,
            peptides: this.peptides,
            name: this.name,
            amount: this.peptideAmount,
            date: this.getDateFormatted(),
            type: this.type
        };
    }
}
