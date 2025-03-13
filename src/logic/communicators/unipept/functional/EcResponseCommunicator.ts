import {EcNamespace} from "@/logic/communicators/unipept/functional/EcResponse";
import FunctionalResponseCommunicator from "@/logic/communicators/unipept/functional/FunctionalResponseCommunicator";
import {FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";

export default class EcResponseCommunicator extends FunctionalResponseCommunicator<EcNamespace> {
    public static readonly EC_ENDPOINT: string = "/private_api/ecnumbers";

    constructor(apiBaseUrl: string, batchSize: number) {
        super(apiBaseUrl, batchSize, EcResponseCommunicator.EC_ENDPOINT);
    }

    protected createPayload(codes: string[]): any {
        return JSON.stringify({ ecnumbers: codes.map(x => x.replace("EC:", "")) });
    }

    protected transformResponse(rawResponse: FunctionalDefinition<EcNamespace>[]): FunctionalDefinition<EcNamespace>[] {
        return rawResponse.map((r: any) => ({
            ...r,
            code: "EC:" + r.code
        }));
    }
}