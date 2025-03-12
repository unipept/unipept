import NetworkUtils from "@/logic/communicators/NetworkUtils";
import {FunctionalNamespace, FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";

export default abstract class FunctionalResponseCommunicator<T extends FunctionalNamespace> {
    private static inProgress: Promise<FunctionalDefinition<any>[]> | undefined;

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
        for (let i = 0; i < codes.length; i += this.batchSize) {
            const payload = this.createPayload(codes.slice(i, i + this.batchSize));
            const res = await NetworkUtils.postJSON(`${this.apiBaseUrl}${this.endpoint}`, payload);

            responses.push(...this.transformResponse(res));
        }

        return responses;
    }

    // Methods to be implemented by subclasses
    protected abstract createPayload(codes: string[]): any;
    protected abstract transformResponse(rawResponse: FunctionalDefinition<T>[]): FunctionalDefinition<T>[];
}