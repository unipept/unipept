import {GoNamespace} from "@/logic/communicators/unipept/functional/GoResponse";
import FunctionalResponseCommunicator from "@/logic/communicators/unipept/functional/FunctionalResponseCommunicator";
import {FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";

export default class GoResponseCommunicator extends FunctionalResponseCommunicator<GoNamespace> {
    public static readonly GO_ENDPOINT: string = "/private_api/goterms";

    constructor(apiBaseUrl: string, batchSize: number) {
        super(apiBaseUrl, batchSize, GoResponseCommunicator.GO_ENDPOINT);
    }

    protected createPayload(codes: string[]): any {
        return JSON.stringify({ goterms: codes });
    }

    protected transformResponse(rawResponse: FunctionalDefinition<GoNamespace>[]): FunctionalDefinition<GoNamespace>[] {
        return rawResponse;
    }
}