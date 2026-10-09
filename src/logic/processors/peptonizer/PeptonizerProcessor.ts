import {Peptonizer, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import CountTable from "@/logic/processors/CountTable";
import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
import UnipeptCommunicator from "@/logic/communicators/unipept/UnipeptCommunicator";
import useBrowserCheck from "@/composables/useBrowserCheck";
import ExclusiveProcessorRunner from "@/logic/processors/peptonizer/ExclusiveProcessorRunner";

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
export const DEFAULT_PEPTONIZER_BETAS: number[] = [0.05, 0.1, 0.2];
export const DEFAULT_PEPTONIZER_PRIORS: number[] = [0.1, 0.3];
const TAXA2RANK_BATCH_SIZE = 10000;

export default class PeptonizerProcessor {
    // One taxonomic run at a time; FA runs have their own queue, so at most one of each runs together.
    private static runner = new ExclusiveProcessorRunner<PeptonizerResult>();

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

        return await PeptonizerProcessor.runner.run(async () => {
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

            return await this.peptonizer.peptonize(
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
        });
    }

    public cancelPeptonizer() {
        if (this.peptonizer) {
            this.peptonizer.cancel();
        }
    }
}
