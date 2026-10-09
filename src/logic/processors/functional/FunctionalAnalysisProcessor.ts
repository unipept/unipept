import {Peptonizer} from "peptonizer";
import CountTable from "@/logic/processors/CountTable";
import {
    DEFAULT_PEPTONIZER_ALPHAS,
    DEFAULT_PEPTONIZER_BETAS,
    DEFAULT_PEPTONIZER_PRIORS,
    DEFAULT_PEPTONIZER_WORKERS
} from "@/logic/processors/peptonizer/PeptonizerProcessor";
import ExclusiveProcessorRunner from "@/logic/processors/peptonizer/ExclusiveProcessorRunner";
import {
    mergePeptideAnnotations,
    mergePeptideCounts,
    mergePeptideIntensities
} from "@/logic/processors/peptonizer/PeptonizerInput";

// The Peptonizer only computes a score for this number of annotations, the other annotations do not get a score
export const MAX_SCORED_ANNOTATIONS = 1000;

export default class FunctionalAnalysisProcessor {
    private static runner = new ExclusiveProcessorRunner<Map<string, number>>();

    // Only created when the run starts, because Peptonizer.cancel() throws before peptonize() is called
    private peptonizer: Peptonizer | undefined;
    private cancelled = false;
    // After Peptonizer.cancel(), peptonize() never settles, so a run must also end when this promise resolves
    private resolveCancelled!: (value: undefined) => void;
    private readonly cancelledPromise = new Promise<undefined>(resolve => this.resolveCancelled = resolve);

    public async runFunctionalAnalysis(
        peptidesFunctions: Map<string, string[]>,
        peptideCountTable: CountTable<string>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
        termFilter?: (term: string) => boolean
    ): Promise<Map<string, number> | undefined> {
        const normalizedCounts = mergePeptideCounts(peptideCountTable.counts.entries(), equateIl);
        const normalizedIntensities = mergePeptideIntensities(peptideIntensities?.entries(), normalizedCounts.keys(), equateIl);

        const filteredFunctions = Array.from(peptidesFunctions.entries())
            .map(([peptide, terms]): [string, string[]] => [peptide, termFilter ? terms.filter(termFilter) : terms])
            .filter(([, terms]) => terms.length > 0);
        const normalizedFunctions = mergePeptideAnnotations(filteredFunctions, equateIl);

        const termToId = new Map<string, number>();
        const idToTerm = new Map<number, string>();
        let idCounter = 0;

        for (const terms of normalizedFunctions.values()) {
            for (const term of terms) {
                if (!termToId.has(term)) {
                    termToId.set(term, idCounter);
                    idToTerm.set(idCounter, term);
                    idCounter++;
                }
            }
        }

        const peptidesFunctionsWithIds = new Map<string, number[]>();
        for (const peptide of normalizedCounts.keys()) {
            const terms = normalizedFunctions.get(peptide) || [];
            peptidesFunctionsWithIds.set(peptide, terms.map(term => termToId.get(term)!));
        }

        // Race against the cancel, so that a run that is cancelled while it waits in the queue returns immediately
        return await Promise.race([this.cancelledPromise, FunctionalAnalysisProcessor.runner.run(async () => {
            if (this.cancelled) {
                return undefined;
            }

            this.peptonizer = new Peptonizer();
            const rawResult = await Promise.race([this.cancelledPromise, this.peptonizer.peptonize(
                peptidesFunctionsWithIds,
                normalizedIntensities,
                normalizedCounts,
                DEFAULT_PEPTONIZER_ALPHAS,
                DEFAULT_PEPTONIZER_BETAS,
                DEFAULT_PEPTONIZER_PRIORS,
                MAX_SCORED_ANNOTATIONS,
                undefined,
                DEFAULT_PEPTONIZER_WORKERS
            )]);

            if (!rawResult) {
                return undefined;
            }

            const resultMap = new Map<string, number>();
            for (const [key, value] of rawResult.entries()) {
                const term = idToTerm.get(Number(key));
                if (term) {
                    resultMap.set(term, value);
                }
            }

            return resultMap;
        })]);
    }

    public cancelFunctionalAnalysis() {
        this.cancelled = true;
        this.resolveCancelled(undefined);
        this.peptonizer?.cancel();
    }
}
