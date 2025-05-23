import CountTable from "@/logic/processors/CountTable";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import {ref, shallowRef} from "vue";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import TaxonomicProcessorWebWorker from "../workers/taxonomicProcessor.worker.ts?worker";
import {ShareableMap, TransferableState} from "shared-memory-datastructures";

export interface TaxonomicProcessorData {
    peptideCounts: Map<string, number>;
    peptideDataTransferable: TransferableState;
}

export interface TaxonomicProcessorWorkerOutput {
    countsPerLcaTransferable: TransferableState;
    lcaToPeptides: Map<number, string[]>;
    peptideToLca: Map<string, number>;
    annotatedCount: number;
}

export default function useTaxonomicProcessor() {
    const countTable = shallowRef<CountTable<number>>();
    const lcaToPeptides = shallowRef<Map<number, string[]>>();
    const peptideToLca = shallowRef<Map<string, number>>();

    const { post } = useAsyncWebWorker<TaxonomicProcessorData, TaxonomicProcessorWorkerOutput>(
        () => new TaxonomicProcessorWebWorker()
    );

    const process = async (
        peptideCounts: CountTable<string>,
        peptideData: ShareableMap<string, PeptideData>
    ) => {
        const processed = await post({
            peptideCounts: new Map(peptideCounts.counts.entries()),
            peptideDataTransferable: peptideData.toTransferableState()
        });

        const countTableMap = ShareableMap.fromTransferableState<number, number>(processed.countsPerLcaTransferable);

        countTable.value = new CountTable(countTableMap, processed.annotatedCount);
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