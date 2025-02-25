import useFunctionalProcessor from "@/composables/processing/functional/useFunctionalProcessor";
import {ShareableMap} from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import {ref} from "vue";
import FunctionalTrust from "@/types/FunctionalTrust";
import CountTable from "@/logic/processors/CountTable";

export default function useGoProcessor() {
    const countTable = ref<CountTable<string>>();
    const trust = ref<FunctionalTrust>();
    const goToPeptides = ref<Map<string, string[]>>();

    const { process: processFunctional } = useFunctionalProcessor();

    const process = async (
        peptideCounts: CountTable<string>,
        peptideData: ShareableMap<string, PeptideData>,
        percentage = 5
    ) => {
        const buffer = peptideData.getBuffers();

        const processed = await processFunctional({
            peptideCounts: new Map(peptideCounts.entries()),
            indexBuffer: buffer[0],
            dataBuffer: buffer[1],
            percentage,
            termPrefix: "go",
            proteinCountProperty: "go"
        });

        countTable.value = new CountTable(processed.sortedCounts, processed.annotatedCount);
        trust.value = {
            annotatedItems: processed.annotatedCount,
            totalItems: peptideCounts.totalCount
        }
        goToPeptides.value = processed.itemToPeptides;
    }

    return {
        countTable,
        trust,
        goToPeptides,

        process
    }
}
