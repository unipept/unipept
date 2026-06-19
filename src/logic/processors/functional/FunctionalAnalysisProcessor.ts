import {Peptonizer, PeptonizerProgressListener} from "peptonizer";
import CountTable from "@/logic/processors/CountTable";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";
import Pept2protCommunicator from "@/logic/communicators/unipept/protein/Pept2protCommunicator";
import Pept2protResponse from "@/logic/communicators/unipept/protein/Pept2protResponse";
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

export type FunctionalAnalysisResult = Map<string, number>;

export type FunctionalTermType = "ec" | "go" | "ipr";

export interface FunctionalAnalysisOptions {
    analysisLabel?: string;
    termFilter?: (term: string) => boolean;
}

const splitTerms = (terms: string): string[] => {
    if (!terms || terms.trim().length === 0) {
        return [];
    }

    return terms
        .split(/\s+/)
        .map(term => term.trim())
        .filter(term => term.length > 0);
};

const normalizeEcTerm = (term: string): string | undefined => {
    const cleaned = term.replace(/^EC:/i, "");
    if (cleaned.length === 0) {
        return undefined;
    }

    return `EC:${cleaned}`;
};

const normalizeGoTerm = (term: string): string | undefined => {
    if (term.startsWith("GO:")) {
        return term;
    }

    if (/^\d+$/.test(term)) {
        return `GO:${term.padStart(7, "0")}`;
    }

    return undefined;
};

const normalizeIprTerm = (term: string): string | undefined => {
    const cleaned = term.replace(/^IPR:/i, "");
    if (cleaned.length === 0) {
        return undefined;
    }

    return `IPR:${cleaned.toUpperCase()}`;
};

const normalizeTerm = (term: string, type: FunctionalTermType): string | undefined => {
    switch (type) {
    case "ec":
        return normalizeEcTerm(term);
    case "go":
        return normalizeGoTerm(term);
    case "ipr":
        return normalizeIprTerm(term);
    }
};

const getTermField = (type: FunctionalTermType): "ec_references" | "go_references" | "interpro_references" => {
    switch (type) {
    case "ec":
        return "ec_references";
    case "go":
        return "go_references";
    case "ipr":
        return "interpro_references";
    }
};

export default class FunctionalAnalysisProcessor {
    private static runner = new ExclusiveProcessorRunner<FunctionalAnalysisResult>();
    private static pept2protCache = new Map<string, Pept2protResponse[]>();

    private peptonizer: Peptonizer;

    constructor() {
        this.peptonizer = new Peptonizer();
    }

    private static createCacheKey(peptides: string[], equateIl: boolean): string {
        const sortedPeptides = [...peptides].sort();
        return `${equateIl ? "1" : "0"}:${sortedPeptides.join("\n")}`;
    }

    private static async getPept2protResponses(peptides: string[], equateIl: boolean): Promise<Pept2protResponse[]> {
        const cacheKey = FunctionalAnalysisProcessor.createCacheKey(peptides, equateIl);
        const cached = FunctionalAnalysisProcessor.pept2protCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const communicator = new Pept2protCommunicator(DEFAULT_API_BASE_URL);
        const responses = await communicator.getResponsesForPeptides(peptides, equateIl);

        FunctionalAnalysisProcessor.pept2protCache.set(cacheKey, responses);

        // Keep memory bounded while still covering EC/GO/IPR reuse patterns.
        if (FunctionalAnalysisProcessor.pept2protCache.size > 4) {
            const oldestKey = FunctionalAnalysisProcessor.pept2protCache.keys().next().value;
            if (oldestKey) {
                FunctionalAnalysisProcessor.pept2protCache.delete(oldestKey);
            }
        }

        return responses;
    }

    public async runFunctionalAnalysisFromPeptideProteinPairs(
        termType: FunctionalTermType,
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

        const normalizedPeptides = Array.from(normalizedCounts.keys());
        const pept2protResponses = await FunctionalAnalysisProcessor.getPept2protResponses(normalizedPeptides, equateIl);

        const termField = getTermField(termType);

        const peptideToProteins = new Map<string, Set<string>>();
        const proteinToTerms = new Map<string, Set<string>>();

        for (const response of pept2protResponses) {
            const normalizedPeptide = canonicalizePeptide(response.peptide, equateIl);
            if (!normalizedCounts.has(normalizedPeptide)) {
                continue;
            }

            const proteinId = response.uniprot_id || response.protein;
            if (!proteinId) {
                continue;
            }

            const rawTerms = splitTerms(response[termField]);
            const normalizedTerms = rawTerms
                .map(term => normalizeTerm(term, termType))
                .filter((term): term is string => term !== undefined)
                .filter(term => termFilter ? termFilter(term) : true);

            if (normalizedTerms.length === 0) {
                continue;
            }

            if (!peptideToProteins.has(normalizedPeptide)) {
                peptideToProteins.set(normalizedPeptide, new Set<string>());
            }
            peptideToProteins.get(normalizedPeptide)!.add(proteinId);

            if (!proteinToTerms.has(proteinId)) {
                proteinToTerms.set(proteinId, new Set<string>());
            }
            for (const term of normalizedTerms) {
                proteinToTerms.get(proteinId)!.add(term);
            }
        }

        if (proteinToTerms.size === 0) {
            return new Map<string, number>();
        }

        const proteinToId = new Map<string, number>();
        const idToProtein = new Map<number, string>();
        let idCounter = 0;

        for (const proteinId of proteinToTerms.keys()) {
            proteinToId.set(proteinId, idCounter);
            idToProtein.set(idCounter, proteinId);
            idCounter++;
        }

        const peptideProteinPairsWithIds = new Map<string, number[]>();
        for (const peptide of normalizedCounts.keys()) {
            const proteins = Array.from(peptideToProteins.get(peptide) || []);
            const numericIds = proteins
                .map(proteinId => proteinToId.get(proteinId)!)
                .filter((id): id is number => id !== undefined);

            peptideProteinPairsWithIds.set(peptide, numericIds);
        }

        return await FunctionalAnalysisProcessor.runner.run(async () => {
            console.log(`Starting ${analysisLabel} with up to ${DEFAULT_PEPTONIZER_WORKERS} workers...`);

            const rawResult = await (this.peptonizer as any).peptonize(
                peptideProteinPairsWithIds,
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

            const proteinProbabilities = new Map<string, number>();
            for (const [key, value] of (rawResult as any).entries()) {
                const proteinId = idToProtein.get(Number(key));
                if (proteinId) {
                    proteinProbabilities.set(proteinId, value as number);
                }
            }

            const termFailureProbabilities = new Map<string, number>();

            for (const [proteinId, terms] of proteinToTerms.entries()) {
                const proteinProbability = proteinProbabilities.get(proteinId) || 0;

                for (const term of terms) {
                    const previousFailure = termFailureProbabilities.get(term) ?? 1;
                    termFailureProbabilities.set(term, previousFailure * (1 - proteinProbability));
                }
            }

            const resultMap = new Map<string, number>();
            for (const [term, failureProbability] of termFailureProbabilities.entries()) {
                resultMap.set(term, 1 - failureProbability);
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