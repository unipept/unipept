import {computed, ref} from "vue";
import {defineStore} from "pinia";
import useSingleAnalysisStore from "@/store/new/SingleAnalysisStore";
import CountTable from "@/logic/new/CountTable";
import usePeptonizerProcessor from "@/composables/new/processing/peptonizer/usePeptonizerProcessor";
import {PeptonizerProgressListener} from "peptonizer";
import {NcbiRank} from "@/logic/new/ontology/taxonomic/Ncbi";

export enum PeptonizerStatus {
    Pending,
    Running,
    Finished
}

export const DEFAULT_PEPTIDE_INTENSITIES: number = 0.7;

const usePeptonizerStore = () => defineStore(`peptonizerStore`, () => {
    const status = ref<PeptonizerStatus>(PeptonizerStatus.Pending);

    const { peptonizerResult, taxonIdToConfidence, process: processPeptonizer } = usePeptonizerProcessor();

    const runPeptonizer = async (
        peptideCountTable: CountTable<string>,
        peptideIntensities?: Map<string, number>,
        rank: NcbiRank,
        taxaInGraph: number,
        listener: PeptonizerProgressListener,
        equateIl: boolean
    ) => {
        status.value = PeptonizerStatus.Running;

        // If no intensities are provided, we set them to the default value
        if (!peptideIntensities) {
            peptideIntensities = new Map<string, number>(Array.from(peptideCountTable.keys()).map((peptide: string) => [peptide, DEFAULT_PEPTIDE_INTENSITIES]));
        }

        // If the equate I / L option is enabled, we need to update the intensities as well
        if (equateIl) {
            // TODO: we need to think about this equation of I and L for the peptonizer again...
            peptideIntensities = new Map<string, number>(Array.from(peptideIntensities.entries()).map(([k, v]) => [k.replace(/I/g, "L"), v]))
        }

        await processPeptonizer(peptideCountTable, peptideIntensities, rank, taxaInGraph, listener);
        status.value = PeptonizerStatus.Finished;
    }

    return {
        status,
        peptonizerResult,
        taxonIdToConfidence,
        runPeptonizer
    }
})();

export type PeptonizerStore = ReturnType<typeof useSingleAnalysisStore>;

export default usePeptonizerStore;
