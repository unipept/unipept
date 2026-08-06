import {Peptonizer, PeptonizerResult} from "peptonizer";
import CountTable from "@/logic/processors/CountTable";
import {
    DEFAULT_PEPTIDE_INTENSITIES,
    DEFAULT_PEPTONIZER_ALPHAS,
    DEFAULT_PEPTONIZER_BETAS,
    DEFAULT_PEPTONIZER_PRIORS,
    DEFAULT_PEPTONIZER_WORKERS
} from "@/logic/processors/peptonizer/PeptonizerProcessor";

// Runs the Peptonizer belief-propagation algorithm over an arbitrary set of peptide-to-term annotations
// (EC numbers, GO terms of a single namespace, InterPro entries, ...) to estimate a presence probability per
// term. A separate instance/run is used per functional-annotation category that should be inferred
// independently (e.g. each GO namespace gets its own run).
export default class FunctionalPeptonizerProcessor {
    // Only one functional-Peptonizer computation should be running at the same time in the application. This
    // lock is shared across every category (EC, each GO namespace, InterPro, ...) and is separate from
    // PeptonizerProcessor's taxonomic lock, so a user-initiated taxonomic run can proceed concurrently.
    private static inProgress: Promise<PeptonizerResult | undefined> | undefined;

    private peptonizer: Peptonizer;

    constructor() {
        this.peptonizer = new Peptonizer();
    }

    public async run(
        peptideTerms: Map<string, string[]>,
        peptideCountTable: CountTable<string>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ): Promise<Map<string, number> | undefined> {
        // If no intensities are provided, we set them to the default value
        if (!peptideIntensities) {
            peptideIntensities = new Map<string, number>(Array.from(peptideCountTable.counts.keys()).map((peptide: string) => [peptide, DEFAULT_PEPTIDE_INTENSITIES]));
        }

        while (FunctionalPeptonizerProcessor.inProgress) {
            await FunctionalPeptonizerProcessor.inProgress;
        }

        try {
            // The peptonizer package requires numeric category IDs, so terms are encoded to (and decoded
            // from) unique positive integers around the call to peptonize().
            const termToId = new Map<string, number>();
            const idToTerm = new Map<number, string>();
            let nextId = 1;

            const peptideTermIds = new Map<string, number[]>();
            for (const [peptide, terms] of peptideTerms) {
                peptideTermIds.set(peptide, terms.map((term) => {
                    let id = termToId.get(term);
                    if (id === undefined) {
                        id = nextId++;
                        termToId.set(term, id);
                        idToTerm.set(id, term);
                    }
                    return id;
                }));
            }

            console.log(`Starting functional Peptonizer with up to ${DEFAULT_PEPTONIZER_WORKERS} workers...`);

            FunctionalPeptonizerProcessor.inProgress = this.peptonizer.peptonize(
                peptideTermIds,
                peptideIntensities,
                new Map<string, number>(Array.from(peptideCountTable.counts.entries())),
                DEFAULT_PEPTONIZER_ALPHAS,
                DEFAULT_PEPTONIZER_BETAS,
                DEFAULT_PEPTONIZER_PRIORS,
                termToId.size,
                undefined,
                DEFAULT_PEPTONIZER_WORKERS
            );

            const result = await FunctionalPeptonizerProcessor.inProgress;

            if (!result) {
                return undefined;
            }

            return new Map<string, number>(
                Array.from(result.entries()).map(([id, probability]) => [idToTerm.get(Number.parseInt(id))!, probability])
            );
        } catch (error) {
            throw error;
        } finally {
            FunctionalPeptonizerProcessor.inProgress = undefined;
        }
    }

    public cancelPeptonizer() {
        if (this.peptonizer) {
            this.peptonizer.cancel();
        }
    }
}
