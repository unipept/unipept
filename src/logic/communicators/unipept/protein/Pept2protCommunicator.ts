import Pept2protResponse from "@/logic/communicators/unipept/protein/Pept2protResponse";
import NetworkUtils from "@/logic/communicators/NetworkUtils";
import {DEFAULT_BATCH_SIZE} from "@/logic/Constants";

const DEFAULT_PARALLEL_REQUESTS = 5;

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

        Pept2protCommunicator.inProgress = this.doProcess([peptide], equateIl);

        let result: Pept2protResponse[];

        try {
            result = await Pept2protCommunicator.inProgress;
        } finally {
            Pept2protCommunicator.inProgress = undefined;
        }

        return result;
    }

    public async getResponsesForPeptides(
        peptides: string[],
        equateIl: boolean
    ): Promise<Pept2protResponse[]> {
        const requests: Array<() => Promise<Pept2protResponse[]>> = [];

        for (let i = 0; i < peptides.length; i += 100) {
            console.log(i, peptides.length);
            const batch = peptides.slice(i, i + 100);
            if (batch.length === 0) {
                continue;
            }

            requests.push(async () => await this.doProcess(batch, equateIl));
        }

        const responses = await runParallel(requests, DEFAULT_PARALLEL_REQUESTS);
        return responses.flat();
    }

    private async doProcess(peptides: string[], equateIl: boolean): Promise<Pept2protResponse[]> {
        const data = JSON.stringify({
            input: peptides,
            equate_il: equateIl,
            extra: true
        });

        return await NetworkUtils.postJSON(
            this.apiBaseUrl + Pept2protCommunicator.PEPT2PROT_ENDPOINT,
            data
        );
    }
}

async function runParallel<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
    const results: T[] = new Array(tasks.length);
    let nextTaskIndex = 0;

    const worker = async () => {
        while (nextTaskIndex < tasks.length) {
            const currentTaskIndex = nextTaskIndex;
            nextTaskIndex++;
            results[currentTaskIndex] = await tasks[currentTaskIndex]();
        }
    };

    const workerCount = Math.min(limit, tasks.length);
    await Promise.all(Array.from({length: workerCount}, async () => await worker()));

    return results;
}
