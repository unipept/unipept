import NetworkUtils from "@/logic/communicators/NetworkUtils";
import ProteinResponse from "@/logic/communicators/unipept/protein/ProteinResponse";

export interface MetaProteinResponse {
    lca: number,
    common_lineage: number[],
    proteins: ProteinResponse[]
}

export default class ProteinResponseCommunicator {
    public static readonly PROTEIN_ENDPOINT: string = "/private_api/proteins";
    public static readonly PROTEIN_COUNT_ENDPOINT: string = "/private_api/proteins/count"
    public static readonly PROTEIN_FILTER_ENDPOINT: string = "/private_api/proteins/filter";

    private static inProgress: Promise<MetaProteinResponse> | undefined;
    private static responsesInProgress: Promise<ProteinResponse[]> | undefined;

    constructor(
        private readonly apiBaseUrl: string,
        private readonly batchSize: number
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

    public async getResponses(
        accessions: string[]
    ): Promise<ProteinResponse[]> {
        while (ProteinResponseCommunicator.responsesInProgress) {
            await ProteinResponseCommunicator.responsesInProgress;
        }

        ProteinResponseCommunicator.responsesInProgress = this.doProcess(accessions);
        let result: ProteinResponse[];

        try {
            result = await ProteinResponseCommunicator.responsesInProgress;
        } finally {
            ProteinResponseCommunicator.responsesInProgress = undefined;
        }

        return result;
    }

    public async getProteinCount(
        filter = ""
    ): Promise<number> {
        const requestBody = JSON.stringify({
                filter
        });

        const res = await NetworkUtils.postJSON(
            this.apiBaseUrl + ProteinResponseCommunicator.PROTEIN_COUNT_ENDPOINT,
            requestBody
        );

        return res["count"];
    }

    public async getProteinRange(
        start: number,
        end: number,
        filter = "",
        sortBy: "uniprot_accession_id" | "name" | "db_type" | "taxon_id" = "uniprot_accession_id",
        sortDescending = false
    ): Promise<string[]> {
        const requestBody = JSON.stringify({
            filter,
            start,
            end,
            sort_by: sortBy,
            sort_descending: sortDescending
        });

        return await NetworkUtils.postJSON(
            this.apiBaseUrl + ProteinResponseCommunicator.PROTEIN_FILTER_ENDPOINT,
            requestBody
        );
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

    private async doProcess(accessionIds: string[]): Promise<ProteinResponse[]> {
        const responses: ProteinResponse[] = [];

        for (let i = 0; i < accessionIds.length; i += this.batchSize) {
            const data = JSON.stringify({
                accessions: accessionIds
            });

            const res =  await NetworkUtils.postJSON(
                this.apiBaseUrl + ProteinResponseCommunicator.PROTEIN_ENDPOINT, data
            );

            responses.push(...res);
        }

        return responses;
    }
}