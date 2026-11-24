import CountTable from "@/logic/processors/CountTable";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import {markRaw, shallowRef} from "vue";
import PeptideCountsWorker from "@/composables/workers/peptideCounts.worker.ts?worker&inline";
import {ShareableMap} from "shared-memory-datastructures";
import type { PeptideCountsInput, PeptideCountsOutput } from "@/logic/processors/peptide/PeptideCounts";

export default function usePeptideProcessor() {
    const countTable = shallowRef<CountTable<string>>();

    const { post } = useAsyncWebWorker<PeptideCountsInput, PeptideCountsOutput>(
        () => new PeptideCountsWorker()
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
