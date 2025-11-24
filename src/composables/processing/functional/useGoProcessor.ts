import useFunctionalProcessor from "@/composables/processing/functional/useFunctionalProcessor";
import {ShareableMap} from "shared-memory-datastructures";
import PeptideDataV2 from "@/logic/ontology/peptides/PeptideDataV2";
import {markRaw, ref, shallowRef, unref} from "vue";
import FunctionalTrust from "@/types/FunctionalTrust";
import CountTable from "@/logic/processors/CountTable";

export default function useGoProcessor() {
    const countTable = shallowRef<CountTable<string>>();
    const trust = shallowRef<FunctionalTrust>();
    const goToPeptides = shallowRef<Map<string, string[]>>();

    const { process: processFunctional } = useFunctionalProcessor();

    const process = async (
        peptideCounts: CountTable<string>,
        peptideData: ShareableMap<string, PeptideDataV2>,
        percentage = 5
    ) => {
        const peptideDataTransferable = peptideData.toTransferableState();
        const peptideCountsTransferable = peptideCounts.counts.toTransferableState();

        const processed = await processFunctional({
            countsMapTransferable: peptideCountsTransferable,
            peptideDataTransferable: peptideDataTransferable,
            percentage,
            termPrefix: "go",
            proteinCountProperty: "go"
        });

        const countTableMap = ShareableMap.fromTransferableState<string, number>(processed.sortedCountsTransferable);

        countTable.value = markRaw(new CountTable(countTableMap, processed.annotatedCount));
        trust.value = {
            annotatedItems: processed.annotatedCount,
            totalItems: peptideCounts.totalCount
        }
        goToPeptides.value = markRaw(processed.itemToPeptides);
    }

    return {
        countTable,
        trust,
        goToPeptides,

        process
    }
}
