import NcbiResponse from "./NcbiResponse";
import NetworkUtils from "@/logic/communicators/NetworkUtils";
import NcbiTaxon, {NcbiId} from "@/logic/ontology/taxonomic/Ncbi";

export default class NcbiResponseCommunicator {
    public static readonly NCBI_ENDPOINT: string = "/private_api/taxa";
    public static readonly NCBI_COUNT_ENDPOINT: string = "/private_api/taxa/count";
    public static readonly NCBI_FILTER_ENDPOINT: string = "/private_api/taxa/filter";

    private static inProgress: Promise<NcbiResponse[]> | undefined;

    constructor(
        private readonly apiBaseUrl: string,
        private readonly batchSize: number
    ) {}

    public async getResponses(
        codes: NcbiId[]
    ): Promise<NcbiResponse[]> {
        while (NcbiResponseCommunicator.inProgress) {
            await NcbiResponseCommunicator.inProgress;
        }

        NcbiResponseCommunicator.inProgress = this.doProcess(codes);
        const result: NcbiResponse[] = [];

        try {
            const data: NcbiResponse[] = await NcbiResponseCommunicator.inProgress;
            result.push(...data);
        } finally {
            NcbiResponseCommunicator.inProgress = undefined;
        }

        return result;
    }

    /**
    * Returns the amount of NCBI taxa that are known to the Unipept API. An optional filter
    * string can be given that allows the database to be filtered by all taxa that contain a specific text in their
    * name.
    *
    * @param filter A portion of text that should be present in the name of all taxa that are returned by this
    * function.
    * */
    public async getNcbiCount(
        filter = ""
    ): Promise<number> {
        const requestBody = JSON.stringify({
            filter
        });

        const res = await NetworkUtils.postJSON(
            this.apiBaseUrl + NcbiResponseCommunicator.NCBI_COUNT_ENDPOINT,
            requestBody
        );

        return res["count"];
    }

    /**
     * Returns a slice of all NCBI id's from the Unipept API starting from row number start (inclusive) and ending at
     * end (exclusive). Note that if a specific name filter is given, only taxa that contain this text as portion of
     * their name will be returned.
     *
     * @param start First NCBI id that should be included in the result (inclusive).
     * @param end First NCBI id that should not be included in the result (exclusive).
     * @param filter Only rows for which either the id, the name or rank contain a portion of this filter are returned.
     * @param sortBy Which taxon property should be used to sort the table?
     * @param sortDescending Sort according to ascending or descending values in the selected column?
     */
    public async getNcbiRange(
        start: number,
        end: number,
        filter = "",
        sortBy: "id" | "name" | "rank" = "id",
        sortDescending = false,
    ): Promise<NcbiId[]> {
        const requestBody = JSON.stringify({
            filter,
            start,
            end,
            sort_by: sortBy,
            sort_descending: sortDescending
        });

        return await NetworkUtils.postJSON(
            this.apiBaseUrl + NcbiResponseCommunicator.NCBI_FILTER_ENDPOINT,
            requestBody
        );
    }

    private async doProcess(
        codes: NcbiId[]
    ): Promise<NcbiResponse[]> {
        const responses: NcbiResponse[] = [];
        for (let i = 0; i < codes.length; i += this.batchSize) {
            const data = JSON.stringify({
                taxids: codes.slice(i, i + this.batchSize)
            });

            const res = await NetworkUtils.postJSON(
                this.apiBaseUrl + NcbiResponseCommunicator.NCBI_ENDPOINT,
                data
            );

            responses.push(...res);
        }

        return responses;
    }
}
