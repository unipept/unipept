import useFunctionalProcessor from "@/composables/new/processing/functional/useFunctionalProcessor";
import {ShareableMap} from "shared-memory-datastructures";
import {PeptideData} from "unipept-web-components";
import {ref} from "vue";
import FunctionalTrust from "@/types/FunctionalTrust";
import CountTable from "@/logic/new/CountTable";

enum EcNamespace {
    // EC 1.x.x.x class
    Oxidoreductases = "oxidoreductases",
    // EC 2.x.x.x class
    Transferases = "transferases",
    // EC 3.x.x.x class
    Hydrolases = "hydrolases",
    // EC 4.x.x.x class
    Lyases = "lyases",
    // EC 5.x.x.x class
    Isomerases = "isomerases",
    // EC 6.x.x.x class
    Ligases = "ligases",
    // EC 7.x.x.x class
    Translocases = "translocases"
}

type Regular = "regular";

export default function useEcProcessor() {
    const countTable = ref<CountTable<string>>();
    const trust = ref<FunctionalTrust>();
    const ecToPeptides = ref<Map<string, string[]>>();

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
            termPrefix: "ec",
            proteinCountProperty: "ec"
        });

        countTable.value = new CountTable(processed.sortedCounts, processed.annotatedCount);
        trust.value = {
            annotatedItems: processed.annotatedCount,
            totalItems: peptideCounts.totalCount
        }
        ecToPeptides.value = processed.itemToPeptides;
    }

    return {
        countTable,
        trust,
        ecToPeptides,

        process
    }
}
