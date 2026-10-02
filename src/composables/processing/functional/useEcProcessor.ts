import useFunctionalProcessor from "@/composables/processing/functional/useFunctionalProcessor";
import {ShareableMap} from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import {markRaw, shallowRef} from "vue";
import FunctionalTrust from "@/types/FunctionalTrust";
import CountTable from "@/logic/processors/CountTable";

export default function useEcProcessor() {
    const countTable = shallowRef<CountTable<string>>();
    const trust = shallowRef<FunctionalTrust>();
    const ecToPeptides = shallowRef<Map<string, string[]>>();
    const peptidesFunctions = shallowRef<Map<string, string[]>>(); // For EC functional analysis

    const { process: processFunctional } = useFunctionalProcessor();

    const process = async (
        peptideCounts: CountTable<string>,
        peptideData: ShareableMap<string, PeptideData>,
        percentage = 5
    ) => {
        const peptideCountsTransferable = peptideCounts.counts.toTransferableState();
        const peptideDataTransferable = peptideData.toTransferableState();

        const processed = await processFunctional({
            countsMapTransferable: peptideCountsTransferable,
            peptideDataTransferable: peptideDataTransferable,
            percentage,
            termPrefix: "ec",
            proteinCountProperty: "ec",
            extractFunctionsMap: true // Extract EC functions for functional analysis
        });

        const countTableMap = ShareableMap.fromTransferableState<string, number>(processed.sortedCountsTransferable);

        countTable.value = markRaw(new CountTable(countTableMap, processed.annotatedCount));
        trust.value = {
            annotatedItems: processed.annotatedCount,
            totalItems: peptideCounts.totalCount
        }
        ecToPeptides.value = markRaw(processed.itemToPeptides);
        peptidesFunctions.value = markRaw(processed.peptidesFunctions || new Map());
    }

    return {
        countTable,
        trust,
        ecToPeptides,
        peptidesFunctions,

        process
    }
}
