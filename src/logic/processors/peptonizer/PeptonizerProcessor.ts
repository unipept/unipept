import {Peptonizer, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import CountTable from "@/logic/processors/CountTable";
import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";

export const DEFAULT_PEPTIDE_INTENSITIES = 0.7;
export const DEFAULT_PEPTONIZER_WORKERS = 2;

export const DEFAULT_TAXA_IN_GRAPH = 25;

// These are the parameters over which the Peptonizer will run a grid search and look for the optimal result
export const DEFAULT_PEPTONIZER_ALPHAS: number[] = [0.8, 0.9, 0.99];
export const DEFAULT_PEPTONIZER_BETAS: number[] = [0.6, 0.7, 0.8, 0.9];
export const DEFAULT_PEPTONIZER_PRIORS: number[] = [0.3, 0.5];

export default class PeptonizerProcessor {
    // Only one instance of the Peptonizer should be running at the same time in the application.
    private static inProgress: Promise<PeptonizerResult | undefined> | undefined;

    private peptonizer: Peptonizer;

    constructor() {
        this.peptonizer = new Peptonizer();
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
            peptideIntensities = new Map<string, number>(Array.from(peptideCountTable.keys()).map((peptide: string) => [peptide, DEFAULT_PEPTIDE_INTENSITIES]));
        }

        // If the equate I / L option is enabled, we need to update the intensities as well
        if (equateIl) {
            peptideIntensities = new Map<string, number>(Array.from(peptideIntensities.entries()).map(([k, v]) => [k.replace(/I/g, "L"), v]))
        }

        while (PeptonizerProcessor.inProgress) {
            await PeptonizerProcessor.inProgress;
        }

        try {
            PeptonizerProcessor.inProgress = this.peptonizer.peptonize(
                peptidesTaxa,
                peptideIntensities,
                new Map<string, number>(Array.from(peptideCountTable.entries())),
                DEFAULT_PEPTONIZER_ALPHAS,
                DEFAULT_PEPTONIZER_BETAS,
                DEFAULT_PEPTONIZER_PRIORS,
                rank,
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
