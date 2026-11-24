import CountTable from "@/logic/processors/CountTable";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import {markRaw, shallowRef} from "vue";
import PeptideProcessorWebWorker from "../workers/peptideProcessor.worker.ts?worker&inline";
import {ShareableMap} from "shared-memory-datastructures";
import type { PeptideProcessorData, PeptideProcessorWorkerOutput } from "@/logic/processors/peptide/PeptideCounts";

export default function usePeptideProcessor() {
    const countTable = shallowRef<CountTable<string>>();

    const { post } = useAsyncWebWorker<PeptideProcessorData, PeptideProcessorWorkerOutput>(
        () => new PeptideProcessorWebWorker()
    );

    const process = async (peptides: string[], equate: boolean, filter: boolean) => {
        const { peptideCountsTransferable, totalPeptideCount } = await post({
            peptides, filter
        });

        const countTableMap = ShareableMap.fromTransferableState<string, number>(peptideCountsTransferable);

        countTable.value = markRaw(new CountTable(countTableMap, totalPeptideCount));
    };

    return {
        countTable,

        process
    };
}
