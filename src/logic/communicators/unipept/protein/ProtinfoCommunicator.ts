import NetworkUtils from "@/logic/communicators/NetworkUtils";

export interface ProtinfoResponse {
    protein: string,
    name: string,
    taxon_name: string
}

export default class ProtinfoCommunicator {
    public static readonly PROTINFO_ENDPOINT: string = "/api/v2/protinfo";

    private static inProgress: Promise<Map<string, ProtinfoResponse>> | undefined;

    constructor(
        private readonly apiBaseUrl: string,
        private readonly batchSize: number
    ) {}

    public async getResponses(
        ...proteins: string[]
    ): Promise<Map<string, ProtinfoResponse>> {
        while (ProtinfoCommunicator.inProgress) {
            await ProtinfoCommunicator.inProgress;
        }

        ProtinfoCommunicator.inProgress = this.doProcess(proteins);
        const result: Map<string, ProtinfoResponse> = new Map();

        try {
            const data: Map<string, ProtinfoResponse> = await ProtinfoCommunicator.inProgress;
            data.forEach((value, key) => {
                result.set(key, value);
            });
        } finally {
            ProtinfoCommunicator.inProgress = undefined;
        }

        return result;
    }

    private async doProcess(
        proteins: string[]
    ): Promise<Map<string, ProtinfoResponse>> {
        const responses: Map<string, ProtinfoResponse> = new Map();
        for (let i = 0; i < proteins.length; i += this.batchSize) {
            const data = JSON.stringify({
                input: proteins.slice(i, i + this.batchSize)
            });

            const res = await NetworkUtils.postJSON(
                this.apiBaseUrl + ProtinfoCommunicator.PROTINFO_ENDPOINT,
                data
            );

            for (const protein of res) {
                responses.set(protein.protein, protein);
            }
        }

        return responses;
    }
}