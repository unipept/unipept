import {computed, ref} from "vue";
import {defineStore} from "pinia";
import useSingleAnalysisStore from "@/store/new/SingleAnalysisStore";
import CountTable from "@/logic/new/CountTable";
import usePeptonizerProcessor from "@/composables/new/processing/peptonizer/usePeptonizerProcessor";
import {GridSearchProgressListener} from "peptonizer";

export enum PeptonizerStatus {
    Pending,
    Running,
    Finished
}

const usePeptonizerStore = () => defineStore(`peptonizerStore`, () => {
    const status = ref<PeptonizerStatus>(PeptonizerStatus.Pending);

    const { peptonizerResult, process: processPeptonizer } = usePeptonizerProcessor();

    const runPeptonizer = async (
        peptideCountTable: CountTable<string>,
        listener: GridSearchProgressListener
    ) => {
        status.value = PeptonizerStatus.Running;
        await processPeptonizer(peptideCountTable);
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
