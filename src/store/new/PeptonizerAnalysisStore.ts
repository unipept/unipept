import {computed, ref} from "vue";
import {defineStore} from "pinia";
import useSingleAnalysisStore from "@/store/new/SingleAnalysisStore";
import CountTable from "@/logic/new/CountTable";
import usePeptonizerProcessor from "@/composables/new/processing/peptonizer/usePeptonizerProcessor";
import {PeptonizerProgressListener} from "peptonizer";

export enum PeptonizerStatus {
    Pending,
    Running,
    Finished
}

export const DEFAULT_PEPTIDE_INTENSITIES: number = 0.7;

const usePeptonizerStore = () => defineStore(`peptonizerStore`, () => {
    const status = ref<PeptonizerStatus>(PeptonizerStatus.Pending);

    const { peptonizerResult, process: processPeptonizer } = usePeptonizerProcessor();

    const runPeptonizer = async (
        peptideCountTable: CountTable<string>,
        peptideIntensities: Map<string, number>,
        listener: PeptonizerProgressListener
    ) => {
        status.value = PeptonizerStatus.Running;
        await processPeptonizer(peptideCountTable, peptideIntensities, listener);
        status.value = PeptonizerStatus.Finished;
    }

    return {
        status,
        peptonizerResult,
        runPeptonizer
    }
})();

export type PeptonizerStore = ReturnType<typeof useSingleAnalysisStore>;

export default usePeptonizerStore;
