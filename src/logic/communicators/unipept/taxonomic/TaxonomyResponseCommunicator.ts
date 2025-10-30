import TaxonomyResponse from "@/logic/communicators/unipept/taxonomic/TaxonomyResponse";
import {NcbiId} from "@/logic/ontology/taxonomic/Ncbi";
import NetworkUtils from "@/logic/communicators/NetworkUtils";

export default class TaxonomyResponseCommunicator {
    public static readonly NCBI_TAXONOMY_ENDPOINT: string = "/api/v2/taxonomy";

    private static inProgress: Promise<TaxonomyResponse[]> | undefined;

    constructor(
        private readonly apiBaseUrl: string,
        private readonly batchSize: number
    ) {}

    public async getResponses(
        codes: NcbiId[]
    ): Promise<TaxonomyResponse[]> {
        while (TaxonomyResponseCommunicator.inProgress) {
            await TaxonomyResponseCommunicator.inProgress;
        }

        TaxonomyResponseCommunicator.inProgress = this.doProcess(codes);
        let result: TaxonomyResponse[];

        try {
            result = await TaxonomyResponseCommunicator.inProgress;
        } finally {
            TaxonomyResponseCommunicator.inProgress = undefined;
        }

        return result;
    }

    private async doProcess(
        codes: NcbiId[]
    ): Promise<TaxonomyResponse[]> {
        const requestBody = JSON.stringify({
            input: codes,
            descendants: true
        });

        return await NetworkUtils.postJSON(
            this.apiBaseUrl + TaxonomyResponseCommunicator.NCBI_TAXONOMY_ENDPOINT,
            requestBody
        );
    }
}