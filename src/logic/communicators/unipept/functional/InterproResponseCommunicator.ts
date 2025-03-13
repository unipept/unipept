import FunctionalResponseCommunicator from "@/logic/communicators/unipept/functional/FunctionalResponseCommunicator";
import {FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";
import {InterproNamespace} from "@/logic/communicators/unipept/functional/InterproResponse";

export default class InterproResponseCommunicator extends FunctionalResponseCommunicator<InterproNamespace> {
    public static readonly INTERPRO_ENDPOINT: string = "/private_api/interpros";

    constructor(apiBaseUrl: string, batchSize: number) {
        super(apiBaseUrl, batchSize, InterproResponseCommunicator.INTERPRO_ENDPOINT);
    }

    protected createPayload(codes: string[]): any {
        return JSON.stringify({ interpros: codes.map(x => x.replace("IPR:", "")) });
    }

    protected transformResponse(rawResponse: FunctionalDefinition<InterproNamespace>[]): FunctionalDefinition<InterproNamespace>[] {
        return rawResponse.map((r: any) => ({
            ...r,
            namespace: r.category.replaceAll(/_/g, " ").toLowerCase(),
            code: `IPR:${r.code}` // Example of field-specific transformation
        }));
    }
}
