import ProteomeResponse from "@/logic/communicators/unipept/proteome/ProteomeResponse";
import NetworkUtils from "@/logic/communicators/NetworkUtils";

export default class ProteomeCommunicator {
    public static readonly PROTEOME_ENDPOINT = "/private_api/proteomes";
    public static readonly PROTEOME_COUNT_ENDPOINT = "/private_api/proteomes/count";
    public static readonly PROTEOME_FILTER_ENDPOINT = "/private_api/proteomes/filter";

    private static inProgress: Promise<ProteomeResponse[]> | undefined;

    constructor(
        private readonly apiBaseUrl: string,
        private readonly batchSize: number
    ) {}

    public async getResponses(
        ids: string[]
    ): Promise<ProteomeResponse[]> {
        while (ProteomeCommunicator.inProgress) {
            await ProteomeCommunicator.inProgress;
        }

        ProteomeCommunicator.inProgress = this.doProcess(ids);
        const result: ProteomeResponse[] = [];

        try {
            const data: ProteomeResponse[] = await ProteomeCommunicator.inProgress;
            result.push(...data);
        } finally {
            ProteomeCommunicator.inProgress = undefined;
        }

        return result;
    }

    /**
     * Retrieves the count of proteomes based on the provided filter.
     *
     * @param idFilter - A filter string used to query proteomes by a portion of their ID. Leave blank to
     * count all proteomes.
     * @return A promise that resolves to the count of proteomes matching the filter.
     */
    public async getProteomeCount(idFilter: string): Promise<number> {
        const data = JSON.stringify({ filter: idFilter });

        const response = await NetworkUtils.postJSON(
            this.apiBaseUrl + ProteomeCommunicator.PROTEOME_COUNT_ENDPOINT,
            data
        );

        return response["count"];
    }


    /**
     * Retrieves a range of proteomes with optional filtering and sorting.
     *
     * @param start First proteome ID that should be included in the result (inclusive).
     * @param end First proteome ID that should not be included in the result (exclusive).
     * @param filter Optional filter string to search for specific proteomes (which contain this filter text in their
     * ID).
     * @param sortBy Optional column by which the items should be filtered
     * @param sortDescending Optional flag to sort results in descending order.
     * @return A promise that resolves to an array of UniProt reference proteome IDs (as strings).
     */
    public async getProteomeRange(
        start: number,
        end: number,
        filter = "",
        sortBy: "id" | "protein_count" | "taxon_name" = "id",
        sortDescending = false
    ): Promise<string[]> {
        const data = JSON.stringify({
            start: start,
            end: end,
            filter: filter,
            sort_by: sortBy,
            sort_descending: sortDescending
        });

        return await NetworkUtils.postJSON(
            this.apiBaseUrl + ProteomeCommunicator.PROTEOME_FILTER_ENDPOINT,
            data
        );
    }

    private async doProcess(
        ids: string[]
    ): Promise<ProteomeResponse[]> {
        const responses: ProteomeResponse[] = [];
        for (let i = 0; i < ids.length; i += this.batchSize) {
            const data = JSON.stringify({
                proteomes: ids.slice(i, i + this.batchSize)
            });

            const res = await NetworkUtils.postJSON(
                this.apiBaseUrl + ProteomeCommunicator.PROTEOME_ENDPOINT,
                data
            );

            responses.push(...res);
        }

        return responses;
    }
}
