import NetworkUtils from "@/logic/communicators/NetworkUtils";
import {FunctionalNamespace, FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";
import { createCacheIdb } from "lru-cache-idb";
import UniprotCommunicator from "@/logic/communicators/uniprot/UniprotCommunicator";
import useMetaData from "@/composables/communication/unipept/useMetaData";

export default abstract class FunctionalResponseCommunicator<T extends FunctionalNamespace> {
    private static inProgress: Promise<FunctionalDefinition<any>[]> | undefined;
    private static lruCache = createCacheIdb<FunctionalDefinition<any>>({ maxItems: 100000, databaseName: "functional_lru_cache" });

    constructor(
        protected readonly apiBaseUrl: string,
        protected readonly batchSize: number,
        private readonly endpoint: string
    ) {}

    public async getResponses(codes: string[]): Promise<FunctionalDefinition<T>[]> {
        // Block until any previously ongoing request is finished
        while (FunctionalResponseCommunicator.inProgress) {
            await FunctionalResponseCommunicator.inProgress;
        }

        FunctionalResponseCommunicator.inProgress = this.doProcess(codes);
        const result: FunctionalDefinition<T>[] = [];

        try {
            const data: FunctionalDefinition<T>[] = await FunctionalResponseCommunicator.inProgress;
            result.push(...data);
        } finally {
            FunctionalResponseCommunicator.inProgress = undefined;
        }

        return result;
    }

    private async doProcess(codes: string[]): Promise<FunctionalDefinition<T>[]> {
        const responses: FunctionalDefinition<T>[] = [];

        const { databaseVersion, process: processMetadata } = useMetaData();
        await processMetadata();
        const uniprotVersion = databaseVersion.value;

        const alreadyProcessedCodes = new Set<string>();
        for (const code of codes) {
            const response = await FunctionalResponseCommunicator.lruCache.get(`${uniprotVersion}__${this.apiBaseUrl}__${this.endpoint}__${code}`);

            if (response) {
                responses.push(response);
                alreadyProcessedCodes.add(code);
            }
        }

        const codesToProcess = codes.filter(code => !alreadyProcessedCodes.has(code));

        for (let i = 0; i < codesToProcess.length; i += this.batchSize) {
            const payload = this.createPayload(codes.slice(i, i + this.batchSize));
            const res = await NetworkUtils.postJSON(`${this.apiBaseUrl}${this.endpoint}`, payload);

            for (const response of this.transformResponse(res)) {
                await FunctionalResponseCommunicator.lruCache.set(`${uniprotVersion}__${this.apiBaseUrl}__${this.endpoint}__${response.code}`, response);
                responses.push(response);
            }
        }

        return responses;
    }

    // Methods to be implemented by subclasses
    protected abstract createPayload(codes: string[]): any;
    protected abstract transformResponse(rawResponse: FunctionalDefinition<T>[]): FunctionalDefinition<T>[];
}