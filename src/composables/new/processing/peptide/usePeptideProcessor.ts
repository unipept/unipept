import CountTable from "@/logic/new/CountTable";
import useAsyncWebWorker from "@/composables/new/useAsyncWebWorker";
import {ref} from "vue";
import PeptideProcessorWebWorker from "../workers/peptideProcessor.worker.ts?worker&inline";

export interface PeptideProcessorData {
    peptides: string[];
    equate: boolean;
    filter: boolean;
}

export interface PeptideProcessorWorkerOutput {
    peptideCounts: number;
    totalPeptideCount: number;
}

export default function usePeptideProcessor() {
    const countTable = ref<CountTable<string>>();

    const { post } = useAsyncWebWorker<PeptideProcessorData, PeptideProcessorWorkerOutput>(
        () => new PeptideProcessorWebWorker()
    );

    const process = async (peptides: string[], equate: boolean, filter: boolean) => {
        const { peptideCounts, totalPeptideCount } = await post({
            peptides, equate, filter
        });

        countTable.value = new CountTable(peptideCounts, totalPeptideCount);
    };

    return {
        countTable,

        process
    };
}
