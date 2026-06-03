import {Peptonizer, PeptonizerProgressListener} from "peptonizer";
import CountTable from "@/logic/processors/CountTable";
import {
    DEFAULT_PEPTONIZER_ALPHAS,
    DEFAULT_PEPTONIZER_BETAS,
    DEFAULT_PEPTONIZER_PRIORS,
    DEFAULT_PEPTONIZER_WORKERS
} from "@/logic/processors/peptonizer/PeptonizerProcessor";
import ExclusiveProcessorRunner from "@/logic/processors/peptonizer/ExclusiveProcessorRunner";
import {
    createDefaultPeptideIntensities,
    DEFAULT_PEPTIDE_INTENSITIES
} from "@/logic/processors/peptonizer/PeptonizerShared";

const canonicalizePeptide = (peptide: string, equateIl: boolean): string => {
    return equateIl ? peptide.replace(/I/g, "L") : peptide;
};

const mergeUniqueTerms = (existing: string[], incoming: string[]) => {
    return Array.from(new Set([...existing, ...incoming]));
};

export type FunctionalAnalysisResult = Map<string, number>;

export interface FunctionalAnalysisOptions {
    analysisLabel?: string;
    termFilter?: (term: string) => boolean;
}

export default class FunctionalAnalysisProcessor {
    private static runner = new ExclusiveProcessorRunner<FunctionalAnalysisResult>();

    private peptonizer: Peptonizer;

    constructor() {
        this.peptonizer = new Peptonizer();
    }

    public async runFunctionalAnalysis(
        peptidesFunctions: Map<string, string[]>,
        peptideCountTable: CountTable<string>,
        listener: PeptonizerProgressListener,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
        options: FunctionalAnalysisOptions = {}
    ): Promise<FunctionalAnalysisResult | undefined> {
        const {analysisLabel = "Functional Analysis", termFilter} = options;

        const normalizedCounts = new Map<string, number>();
        for (const [peptide, count] of peptideCountTable.counts.entries()) {
            const normalizedPeptide = canonicalizePeptide(peptide, equateIl);
            normalizedCounts.set(normalizedPeptide, (normalizedCounts.get(normalizedPeptide) || 0) + count);
        }

        let normalizedIntensities = new Map<string, number>();
        if (!peptideIntensities) {
            normalizedIntensities = createDefaultPeptideIntensities(normalizedCounts.keys(), DEFAULT_PEPTIDE_INTENSITIES);
        } else {
            for (const [peptide, intensity] of peptideIntensities.entries()) {
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
            const numericIds = terms
                .map(term => termToId.get(term)!)
                .filter((id): id is number => id !== undefined);

            peptidesFunctionsWithIds.set(peptide, numericIds);
        }

        return await FunctionalAnalysisProcessor.runner.run(async () => {
            console.log(`Starting ${analysisLabel} with up to ${DEFAULT_PEPTONIZER_WORKERS} workers...`);

            const rawResult = await (this.peptonizer as any).functionalAnalysis(
                peptidesFunctionsWithIds,
                normalizedIntensities,
                normalizedCounts,
                DEFAULT_PEPTONIZER_ALPHAS,
                DEFAULT_PEPTONIZER_BETAS,
                DEFAULT_PEPTONIZER_PRIORS,
                100,
                listener,
                DEFAULT_PEPTONIZER_WORKERS
            );

            if (!rawResult) {
                return undefined;
            }

            const resultMap = new Map<string, number>();
            for (const [key, value] of (rawResult as any).entries()) {
                const term = idToTerm.get(Number(key));
                if (term) {
                    resultMap.set(term, value as number);
                }
            }

            return resultMap;
        });
    }

    public cancelFunctionalAnalysis() {
        if (this.peptonizer) {
            this.peptonizer.cancel();
        }
    }
}