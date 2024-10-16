import {defineStore} from "pinia";
import usePeptideProcessor from "@/composables/new/processing/usePeptideProcessor";
import usePept2filtered from "@/composables/new/communication/unipept/usePept2filtered";
import usePeptideTrustProcessor from "@/composables/new/processing/usePeptideTrustProcessor";

const useAnalysis = defineStore('analysis', () => {
    const { process: processPept2Filtered } = usePept2filtered();

    const { processOnWorker: processPeptides } = usePeptideProcessor();
    const { process: processPeptideTrust } = usePeptideTrustProcessor();

    const analyse = async (
        peptides: string[],
        equateIl: boolean,
        filterDuplicates: boolean,
        cleavageHandling: boolean
    ) => {
        const peptideCountTable = await processPeptides(peptides, equateIl, filterDuplicates);

        const peptideData = await processPept2Filtered(peptideCountTable.getOntologyIds(), equateIl);

        const peptideTrust = processPeptideTrust(peptideCountTable, peptideData);

        console.log(peptideTrust);
    }

    return {
        analyse,
    };
});

export default useAnalysis;
