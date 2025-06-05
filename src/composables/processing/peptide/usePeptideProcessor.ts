import CountTable from "@/logic/processors/CountTable";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import {markRaw, ref, shallowRef} from "vue";
import PeptideProcessorWebWorker from "../workers/peptideProcessor.worker.ts?worker&inline";
import {ShareableMap, TransferableState} from "shared-memory-datastructures";

export interface PeptideProcessorData {
    peptides: string[];
    equate: boolean;
    filter: boolean;
}

export interface PeptideProcessorWorkerOutput {
    peptideCountsTransferable: TransferableState;
    totalPeptideCount: number;
}

export default function usePeptideProcessor() {
    const countTable = shallowRef<CountTable<string>>();

    const { post } = useAsyncWebWorker<PeptideProcessorData, PeptideProcessorWorkerOutput>(
        () => new PeptideProcessorWebWorker()
    );

    const process = async (peptides: string[], equate: boolean, filter: boolean) => {
        const { peptideCountsTransferable, totalPeptideCount } = await post({
            peptides, equate, filter
        });

        const countTableMap = ShareableMap.fromTransferableState<string, number>(peptideCountsTransferable);

        countTable.value = markRaw(new CountTable(countTableMap, totalPeptideCount));
    };

    return {
        countTable,

        process
    };
}
