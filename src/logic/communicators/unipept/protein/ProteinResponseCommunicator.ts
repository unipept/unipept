import NetworkUtils from "@/logic/communicators/NetworkUtils";

export interface ProteinResponse {
    uniprotAccessionId: string,
    name: string,
    organism: number,
    ecNumbers: string[],
    goTerms: string[],
    interproEntries: string[]
}

export interface MetaProteinResponse {
    lca: number,
    common_lineage: number[],
    proteins: ProteinResponse[]
}

export default class ProteinResponseCommunicator {
    public static readonly PROTEIN_ENDPOINT: string = "/private_api/proteins";

    private static inProgress: Promise<MetaProteinResponse> | undefined;

    constructor(
        private readonly apiBaseUrl: string
    ) {}

    /**
     * Returns the API-response from Unipept that contains all protein information associated with the given peptide.
     *
     * @param peptide The peptide for which UniProt-data should be retrieved.
     * @param equateIl Should we treat the amino acids I and L to be equal during the analysis? This effectively means
     * that all I's in the peptide will be replaced by L's before continuing.
     * @return A list of protein responses that's guaranteed to be sorted by organism name (a -> z).
     */
    public async getResponse(peptide: string, equateIl: boolean): Promise<MetaProteinResponse | undefined> {
        if (ProteinResponseCommunicator.inProgress) {
            await ProteinResponseCommunicator.inProgress;
        }

        ProteinResponseCommunicator.inProgress = this.compute(peptide, equateIl);
        const data = await ProteinResponseCommunicator.inProgress;
        ProteinResponseCommunicator.inProgress = undefined;

        return data;
    }

    private async compute(peptide: string, equateIl: boolean): Promise<MetaProteinResponse> {
        const data = JSON.stringify({
            peptide: peptide,
            equate_il: equateIl
        });

        return await NetworkUtils.postJSON(
            this.apiBaseUrl + ProteinResponseCommunicator.PROTEIN_ENDPOINT, data
        );
    }
}