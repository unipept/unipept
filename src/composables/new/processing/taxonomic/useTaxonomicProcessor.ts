import CountTable from "@/logic/new/CountTable";
import useAsyncWebWorker from "@/composables/new/useAsyncWebWorker";
import {ref} from "vue";
import {ShareableMap} from "shared-memory-datastructures";
import {PeptideData} from "unipept-web-components";
import TaxonomicProcessorWebWorker from "../workers/taxonomicProcessor.worker.ts?worker";

export interface TaxonomicProcessorData {
    peptideCounts: Map<string, number>;
    indexBuffer: ArrayBuffer;
    dataBuffer: ArrayBuffer;
}

export default function useTaxonomicProcessor() {
    const countTable = ref<CountTable<number>>();
    const lcaToPeptides = ref<Map<number, string[]>>();
    const peptideToLca = ref<Map<string, number>>();

    const { post } = useAsyncWebWorker(() => new TaxonomicProcessorWebWorker());

    const process = async (
        peptideCounts: CountTable<string>,
        peptideData: ShareableMap<string, PeptideData>
    ) => {
        const buffer = peptideData.getBuffers();

        const processed = await post({
            peptideCounts: new Map(peptideCounts.entries()),
            indexBuffer: buffer[0],
            dataBuffer: buffer[1]
        });

        countTable.value = new CountTable(processed.countsPerLca, processed.annotatedCount);
        lcaToPeptides.value = processed.lcaToPeptides;
        peptideToLca.value = processed.peptideToLca;
    }

    return {
        countTable,
        lcaToPeptides,
        peptideToLca,

        process
    }
}