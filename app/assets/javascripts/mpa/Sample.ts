import {postJSON} from "../utils";
import DataRepository from "./datasource/DataRepository";
import ProgressListener from "./ProgressListener";
import PeptideContainer from './PeptideContainer'
import TaxaDataSource from './datasource/TaxaDataSource';


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

    /**
     * Converts a list of peptides to uppercase
     *
     * @param peptides a list of peptides
     * @return The converted list
     */
    static cleanPeptides(peptides: string[]): string[] {
        return peptides.map(p => p.toUpperCase());
    }

    /**
     * Creates a tree like structure, that is this.tree where each node has an
     * `included` property. This property indicates if this node or any of its
     * children contain the, sought for, functional annotation (code).
     *
     * @param code The FA term to look for
     * @return A taxon tree-like object annotated with `included`
     */
    async getFATree(code: string): Promise<object> {
        let taxaDataSource: TaxaDataSource = await this._dataRepository.createTaxaDataSource();
        return taxaDataSource.getTreeByFA(code);
    }
}
