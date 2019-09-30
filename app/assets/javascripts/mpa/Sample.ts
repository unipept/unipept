import {postJSON} from "../utils";
import DataRepository from "./datasource/DataRepository";
import ProgressListener from "./ProgressListener";
import PeptideContainer from './PeptideContainer'

export default class Sample {
    public static readonly TAXA_URL: string = "/private_api/taxa";

    private _dataRepository: DataRepository;
    private _peptideContainer: PeptideContainer;

    /**
     * Creates a Dataset object based on a list of peptides
     *
     * @param {string[]} [peptides=[]] A list of peptides (strings)
     * @param {string} id Unique identifier associated with this Dataset.
     */
    constructor(peptideContainer: PeptideContainer, mpaConfig: MPAConfig, progressListener: ProgressListener) {
        this._peptideContainer = peptideContainer;

        this._dataRepository = new DataRepository(this, mpaConfig);
        this._dataRepository.registerProgressListener(progressListener);
    }

    get peptideContainer(): PeptideContainer{
        return this._peptideContainer;
    }

    get dataRepository(): DataRepository {
        return this._dataRepository;
    }

    /**
     * Fetches the taxon info from the Unipept API for a list of taxon id's and
     * returns an Array of objects containing the id, name and rank for each
     * result.
     *
     * @param taxids Array containing taxon id integers
     * @return containing an array of result objects
     * with id, name and rank fields
     */
    static getTaxonInfo(taxids: number[]): Promise<TaxonInfo[]> {
        return postJSON(Sample.TAXA_URL, JSON.stringify({taxids: taxids}));
    }
}
