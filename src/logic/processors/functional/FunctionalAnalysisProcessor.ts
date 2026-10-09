import {Peptonizer} from "peptonizer";
import CountTable from "@/logic/processors/CountTable";
import {
    DEFAULT_PEPTIDE_INTENSITIES,
    DEFAULT_PEPTONIZER_ALPHAS,
    DEFAULT_PEPTONIZER_BETAS,
    DEFAULT_PEPTONIZER_PRIORS,
    DEFAULT_PEPTONIZER_WORKERS
} from "@/logic/processors/peptonizer/PeptonizerProcessor";
import ExclusiveProcessorRunner from "@/logic/processors/peptonizer/ExclusiveProcessorRunner";

const canonicalizePeptide = (peptide: string, equateIl: boolean): string => {
    return equateIl ? peptide.replace(/I/g, "L") : peptide;
};

const mergeUniqueTerms = (existing: string[], incoming: string[]) => {
    return Array.from(new Set([...existing, ...incoming]));
};

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
        const normalizedCounts = new Map<string, number>();
        for (const [peptide, count] of peptideCountTable.counts.entries()) {
            const normalizedPeptide = canonicalizePeptide(peptide, equateIl);
            normalizedCounts.set(normalizedPeptide, (normalizedCounts.get(normalizedPeptide) || 0) + count);
        }

        const normalizedIntensities = new Map<string, number>();
        for (const [peptide, intensity] of peptideIntensities ?? []) {
            const normalizedPeptide = canonicalizePeptide(peptide, equateIl);
            if (!normalizedIntensities.has(normalizedPeptide)) {
                normalizedIntensities.set(normalizedPeptide, intensity);
            }
        }

        for (const peptide of normalizedCounts.keys()) {
            if (!normalizedIntensities.has(peptide)) {
                normalizedIntensities.set(peptide, DEFAULT_PEPTIDE_INTENSITIES);
            }
        }

        const normalizedFunctions = new Map<string, string[]>();
        for (const [peptide, terms] of peptidesFunctions.entries()) {
            const filteredTerms = termFilter ? terms.filter(termFilter) : terms;
            if (filteredTerms.length === 0) {
                continue;
            }

            const normalizedPeptide = canonicalizePeptide(peptide, equateIl);
            normalizedFunctions.set(
                normalizedPeptide,
                mergeUniqueTerms(normalizedFunctions.get(normalizedPeptide) || [], filteredTerms)
            );
        }

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
