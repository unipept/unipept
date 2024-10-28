import {useWebWorker} from "@vueuse/core";
import CountTable from "@/logic/new/CountTable";
import useAsyncWebWorker from "@/composables/new/useAsyncWebWorker";
import {ref} from "vue";

export interface PeptideProcessorData {
    peptides: string[];
    equate: boolean;
    filter: boolean;
}

export default function usePeptideProcessor() {
    const countTable = ref<CountTable<string>>();

    const { post } = useAsyncWebWorker('./src/composables/new/processing/workers/PeptideProcessor.worker.ts');

    const process = async (peptides: [], equate: boolean, filter: boolean) => {
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
