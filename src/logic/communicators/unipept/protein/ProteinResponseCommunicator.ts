import NetworkUtils from "@/logic/communicators/NetworkUtils";
import ProteinResponse from "@/logic/communicators/unipept/protein/ProteinResponse";

export default class ProteinResponseCommunicator {
    public static readonly PROTEIN_ENDPOINT: string = "/private_api/proteins";
    public static readonly PROTEIN_COUNT_ENDPOINT: string = "/private_api/proteins/count"
    public static readonly PROTEIN_FILTER_ENDPOINT: string = "/private_api/proteins/filter";

    private static responsesInProgress: Promise<ProteinResponse[]> | undefined;

    constructor(
        private readonly apiBaseUrl: string,
        private readonly batchSize: number
    ) {}

    public async getResponses(
        accessions: string[]
    ): Promise<ProteinResponse[]> {
        while (ProteinResponseCommunicator.responsesInProgress) {
            // An error of the previous request is reported to its own caller, not to the requests that wait for it
            await ProteinResponseCommunicator.responsesInProgress.catch(() => undefined);
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
        sortBy: "uniprot_accession_number" | "name" | "db_type" | "taxon_id" = "uniprot_accession_number",
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

    private async doProcess(accessionIds: string[]): Promise<ProteinResponse[]> {
        const responses: ProteinResponse[] = [];

        for (let i = 0; i < accessionIds.length; i += this.batchSize) {
            const data = JSON.stringify({
                accessions: accessionIds.slice(i, i + this.batchSize)
            });

            const res =  await NetworkUtils.postJSON(
                this.apiBaseUrl + ProteinResponseCommunicator.PROTEIN_ENDPOINT, data
            );

            for (const r of res) {
                responses.push(r);
            }
        }

        return responses;
    }
}