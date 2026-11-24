import CountTable from "@/logic/processors/CountTable";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import {markRaw, shallowRef} from "vue";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import TaxonomicProcessorWebWorker from "../workers/taxonomicProcessor.worker.ts?worker";
import {ShareableMap} from "shared-memory-datastructures";
import type { TaxonomicProcessorData, TaxonomicProcessorWorkerOutput } from "@/logic/processors/taxonomic/TaxonAggregation";

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

        const countTableMap = markRaw(ShareableMap.fromTransferableState<number, number>(processed.countsPerLcaTransferable));

        countTable.value = markRaw(new CountTable(countTableMap, processed.annotatedCount));
        lcaToPeptides.value = markRaw(processed.lcaToPeptides);
        peptideToLca.value = markRaw(processed.peptideToLca);
    }

    return {
        countTable,
        lcaToPeptides,
        peptideToLca,

        process
    }
}