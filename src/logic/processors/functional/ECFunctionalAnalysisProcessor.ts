import {Peptonizer, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import CountTable from "@/logic/processors/CountTable";
import { DEFAULT_PEPTONIZER_ALPHAS, DEFAULT_PEPTONIZER_BETAS, DEFAULT_PEPTONIZER_PRIORS, DEFAULT_PEPTONIZER_WORKERS } from "@/logic/processors/peptonizer/PeptonizerProcessor";
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

export type ECFunctionalAnalysisResult = Map<string, number>;

/**
 * Processor for EC functional analysis using Peptonizer's functionalAnalysis method.
 * This performs probability-based analysis of which EC terms are active.
 */
export default class ECFunctionalAnalysisProcessor {
    private static runner = new ExclusiveProcessorRunner<ECFunctionalAnalysisResult>();

    private peptonizer: Peptonizer;

    constructor() {
        this.peptonizer = new Peptonizer();
    }

    /**
     * Run functional analysis on EC terms to determine which ones are likely active based on probabilities.
     * 
     * @param peptidesFunctions Map from peptide sequences to their associated EC terms (e.g., "EC:1.1.1.1")
     * @param peptideCountTable Count table for all peptides
     * @param listener Progress listener for updates
     * @param equateIl Whether to equate I and L amino acids
     * @param peptideIntensities Optional intensities per peptide (defaults to 0.7)
     * @returns Map of EC terms to their probabilities
     */
    public async runECFunctionalAnalysis(
        peptidesFunctions: Map<string, string[]>,
        peptideCountTable: CountTable<string>,
        listener: PeptonizerProgressListener,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ): Promise<ECFunctionalAnalysisResult | undefined> {
        // Normalize peptide keys (apply I->L if requested) and ensure all maps share the same peptide set
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
                // keep the first provided intensity if duplicates occur
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
            const normalizedPeptide = canonicalizePeptide(peptide, equateIl);
            normalizedFunctions.set(
                normalizedPeptide,
                mergeUniqueTerms(normalizedFunctions.get(normalizedPeptide) || [], terms)
            );
        }

        // Create a mapping from EC numbers to numeric IDs
        const ecToId = new Map<string, number>();
        const idToEc = new Map<number, string>();
        let idCounter = 0;

        // Collect all unique EC numbers and assign IDs
        for (const ecTerms of normalizedFunctions.values()) {
            for (const ecTerm of ecTerms) {
                if (!ecToId.has(ecTerm)) {
                    ecToId.set(ecTerm, idCounter);
                    idToEc.set(idCounter, ecTerm);
                    idCounter++;
                }
            }
        }

        // Convert peptidesFunctions to use numeric IDs instead of EC strings and ensure every peptide from counts is present
        const peptidesFunctionsWithIds = new Map<string, number[]>();
        for (const peptide of normalizedCounts.keys()) {
            const ecTerms = normalizedFunctions.get(peptide) || [];
            const numericIds = ecTerms.map(ecTerm => ecToId.get(ecTerm)!).filter((id): id is number => id !== undefined);
            peptidesFunctionsWithIds.set(peptide, numericIds);
        }

        return await ECFunctionalAnalysisProcessor.runner.run(async () => {
            console.log(`Starting EC Functional Analysis with up to ${DEFAULT_PEPTONIZER_WORKERS} workers...`);

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

            // Map numeric IDs back to EC numbers
            if (rawResult) {
                const resultMap = new Map<string, number>();
                for (const [key, value] of (rawResult as any).entries()) {
                    const ecNumber = idToEc.get(Number(key));
                    if (ecNumber) {
                        resultMap.set(ecNumber, value as number);
                    }
                }
                return resultMap;
            }

            return undefined;
        });
    }

    public cancelECFunctionalAnalysis() {
        if (this.peptonizer) {
            this.peptonizer.cancel();
        }
    }
}
