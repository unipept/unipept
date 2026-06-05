import {Peptonizer, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import CountTable from "@/logic/processors/CountTable";
import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
import UnipeptCommunicator from "@/logic/communicators/unipept/UnipeptCommunicator";
import useBrowserCheck from "@/composables/useBrowserCheck";

const { isSafari, isFirefox, isChromium } = useBrowserCheck();

export const DEFAULT_PEPTIDE_INTENSITIES = 0.7;

export const DEFAULT_PEPTONIZER_WORKERS = (() => {
    if (isSafari()) {
        return parseInt(import.meta.env.MAX_PEPTONIZER_WORKERS_SAFARI) || 2;
    } else if (isFirefox()) {
        return parseInt(import.meta.env.MAX_PEPTONIZER_WORKERS_FIREFOX) || 6;
    } else if (isChromium()) {
        return parseInt(import.meta.env.MAX_PEPTONIZER_WORKERS_CHROMIUM) || 8;
    } else {
        return parseInt(import.meta.env.MAX_PEPTONIZER_WORKERS_DEFAULT) || 4;
    }
})();

export const DEFAULT_TAXA_IN_GRAPH = 25;

// These are the parameters over which the Peptonizer will run a grid search and look for the optimal result
export const DEFAULT_PEPTONIZER_ALPHAS: number[] = [0.8, 0.9, 0.99];
export const DEFAULT_PEPTONIZER_BETAS: number[] = [0.6, 0.7, 0.8, 0.9];
export const DEFAULT_PEPTONIZER_PRIORS: number[] = [0.3, 0.5];
const TAXA2RANK_BATCH_SIZE = 10000;

export default class PeptonizerProcessor {
    // Only one instance of the Peptonizer should be running at the same time in the application.
    private static inProgress: Promise<PeptonizerResult | undefined> | undefined;

    private peptonizer: Peptonizer;
    private unipeptCommunicator: UnipeptCommunicator;

    constructor() {
        this.peptonizer = new Peptonizer();
        this.unipeptCommunicator = new UnipeptCommunicator();
    }

    public async runPeptonizer(
        peptidesTaxa: Map<string, number[]>,
        peptideCountTable: CountTable<string>,
        rank: NcbiRank,
        listener: PeptonizerProgressListener,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ): Promise<PeptonizerResult | undefined> {
        // If no intensities are provided, we set them to the default value
        if (!peptideIntensities) {
            peptideIntensities = new Map<string, number>(Array.from(peptideCountTable.counts.keys()).map((peptide: string) => [peptide, DEFAULT_PEPTIDE_INTENSITIES]));
        }

        while (PeptonizerProcessor.inProgress) {
            await PeptonizerProcessor.inProgress;
        }

        try {
            const peptideEntries = Array.from(peptidesTaxa.entries());
            const mappedTaxa: number[][] = [];

            for (let index = 0; index < peptideEntries.length; index += TAXA2RANK_BATCH_SIZE) {
                const batch = peptideEntries.slice(index, index + TAXA2RANK_BATCH_SIZE);
                const batchMappedTaxa = await this.unipeptCommunicator.taxa2rank(
                    batch.map(([, taxa]) => taxa),
                    rank
                );

                mappedTaxa.push(...batchMappedTaxa);
            }

            const mappedPeptidesTaxa = new Map<string, number[]>(
                peptideEntries.map(([peptide], index) => [peptide, mappedTaxa[index] ?? []])
            );

            console.log(`Starting Peptonizer with up to ${DEFAULT_PEPTONIZER_WORKERS} workers...`);

            PeptonizerProcessor.inProgress = this.peptonizer.peptonize(
                mappedPeptidesTaxa,
                peptideIntensities,
                new Map<string, number>(Array.from(peptideCountTable.counts.entries())),
                DEFAULT_PEPTONIZER_ALPHAS,
                DEFAULT_PEPTONIZER_BETAS,
                DEFAULT_PEPTONIZER_PRIORS,
                DEFAULT_TAXA_IN_GRAPH,
                listener,
                DEFAULT_PEPTONIZER_WORKERS
            );

            return await PeptonizerProcessor.inProgress;
        } catch (error) {
            throw error;
        } finally {
            PeptonizerProcessor.inProgress = undefined;
        }
    }

    public cancelPeptonizer() {
        if (this.peptonizer) {
            this.peptonizer.cancel();
        }
    }
}
