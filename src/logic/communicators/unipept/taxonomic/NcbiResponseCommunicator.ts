import NcbiResponse from "./NcbiResponse";
import NetworkUtils from "@/logic/communicators/NetworkUtils";
import {NcbiId} from "@/logic/ontology/taxonomic/Ncbi";
import {createCacheIdb} from "lru-cache-idb";
import {FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";
import useMetaData from "@/composables/communication/unipept/useMetaData";

export default class NcbiResponseCommunicator {
    public static readonly NCBI_ENDPOINT: string = "/private_api/taxa";
    public static readonly NCBI_COUNT_ENDPOINT: string = "/private_api/taxa/count";
    public static readonly NCBI_FILTER_ENDPOINT: string = "/private_api/taxa/filter";

    private static inProgress: Promise<NcbiResponse[]> | undefined;
    private static lruCache = createCacheIdb<NcbiResponse>({ maxItems: 100000, databaseName: "taxonomic_lru_cache" });

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
        let result: NcbiResponse[];

        try {
            result = await NcbiResponseCommunicator.inProgress;
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

        const { databaseVersion, process: processMetadata } = useMetaData();
        await processMetadata();
        const uniprotVersion = databaseVersion.value;

        const alreadyProcessedCodes = new Set<number>();
        for (const code of codes) {
            const response = await NcbiResponseCommunicator.lruCache.get(`${uniprotVersion}__${this.apiBaseUrl}__ncbi__${code}`);

            if (response) {
                responses.push(response);
                alreadyProcessedCodes.add(code);
            }
        }

        const codesToProcess = codes.filter(code => !alreadyProcessedCodes.has(code));

        for (let i = 0; i < codesToProcess.length; i += this.batchSize) {
            const data = JSON.stringify({
                taxids: codesToProcess.slice(i, i + this.batchSize)
            });

            const res = await NetworkUtils.postJSON(
                this.apiBaseUrl + NcbiResponseCommunicator.NCBI_ENDPOINT,
                data
            );

            for (const response of res) {
                await NcbiResponseCommunicator.lruCache.set(`${uniprotVersion}__${this.apiBaseUrl}__ncbi__${codesToProcess[i]}`, response);
            }

            responses.push(...res);
        }

        return responses;
    }
}
