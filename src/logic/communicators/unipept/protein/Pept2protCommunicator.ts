import Pept2protResponse from "@/logic/communicators/unipept/protein/Pept2protResponse";
import NetworkUtils from "@/logic/communicators/NetworkUtils";

export default class Pept2protCommunicator {
    public static readonly PEPT2PROT_ENDPOINT = "/api/v2/pept2prot";

    private static inProgress: Promise<Pept2protResponse[]> | undefined;

    constructor(
        private readonly apiBaseUrl: string
    ) {}

    public async getResponses(
        peptide: string,
        equateIl: boolean
    ): Promise<Pept2protResponse[]> {
        if (Pept2protCommunicator.inProgress) {
            await Pept2protCommunicator.inProgress;
        }

        Pept2protCommunicator.inProgress = this.doProcess(peptide, equateIl);

        let result: Pept2protResponse[];

        try {
            result = await Pept2protCommunicator.inProgress;
        } finally {
            Pept2protCommunicator.inProgress = undefined;
        }

        return result;
    }

    private async doProcess(peptide: string, equateIl: boolean): Promise<Pept2protResponse[]> {
        const data = JSON.stringify({
            input: [peptide],
            equate_il: equateIl,
            extra: true
        });

        return await NetworkUtils.postJSON(
            this.apiBaseUrl + Pept2protCommunicator.PEPT2PROT_ENDPOINT,
            data
        );
    }
}
