import {ref, shallowRef} from "vue";
import CountTable from "@/logic/processors/CountTable";
import FunctionalAnalysisProcessor from "@/logic/processors/functional/FunctionalAnalysisProcessor";

type TermFilter = ((term: string) => boolean) | undefined;

// Computes the NORI score of each annotation of one type (EC, GO or InterPro) in the background
export default function useNoriProcessor() {
    const scores = shallowRef<Map<string, number>>();
    const loading = ref(false);
    // Message of the error of the last run, undefined if the last run did not fail
    const error = ref<string>();

    let processors: FunctionalAnalysisProcessor[] = [];
    // Starts the last run again with the same input
    let rerun: (() => Promise<void>) | undefined;

    const cancel = () => {
        processors.forEach(processor => processor.cancelFunctionalAnalysis());
        processors = [];
        scores.value = undefined;
        error.value = undefined;
        loading.value = false;
    };

    // Every term filter gets its own NORI run (GO has one run per namespace). The scores of all runs are combined.
    const process = async (
        peptidesFunctions: Map<string, string[]>,
        peptideCountTable: CountTable<string>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
        termFilters: TermFilter[] = [undefined]
    ) => {
        rerun = () => process(peptidesFunctions, peptideCountTable, equateIl, peptideIntensities, termFilters);
        cancel();
        if (peptidesFunctions.size === 0) {
            return;
        }

        const current = termFilters.map(() => new FunctionalAnalysisProcessor());
        processors = current;
        loading.value = true;

        try {
            const result = new Map<string, number>();
            for (const [i, termFilter] of termFilters.entries()) {
                const runScores = await current[i].runFunctionalAnalysis(
                    peptidesFunctions, peptideCountTable, equateIl, peptideIntensities, termFilter
                );

                // No scores are returned if the run has been cancelled
                if (!runScores) {
                    return;
                }
                runScores.forEach((score, term) => result.set(term, score));
            }
            scores.value = result;
        } catch (e) {
            console.error(e);
            if (processors === current) {
                error.value = e instanceof Error ? e.message : String(e);
            }
        } finally {
            if (processors === current) {
                loading.value = false;
            }
        }
    };

    const retry = async () => {
        await rerun?.();
    };

    return {
        scores,
        loading,
        error,

        process,
        retry,
        cancel
    };
}
