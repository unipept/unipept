import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import useOntologyStore from "@/store/new/OntologyStore";
import {NcbiTaxon} from "@/logic/new/ontology/taxonomic/Ncbi";
import FunctionalDefinition from "@/logic/new/ontology/functional/FunctionalDefinition";
import PeptideExportProcessorWorker from "@/composables/new/processing/workers/peptideExportProcessor.worker.ts?worker";
import useAsyncWebWorker from "@/composables/new/useAsyncWebWorker";
import {toRaw} from "vue";


export interface PeptideExportData {
    peptideTable: Map<string, number>;
    goOntology: Map<string, FunctionalDefinition>;
    ecOntology: Map<string, FunctionalDefinition>;
    iprOntology: Map<string, FunctionalDefinition>;
    ncbiOntology: Map<number, NcbiTaxon>;
    indexBuffer: ArrayBuffer,
    dataBuffer: ArrayBuffer,
    separator: string;
}

export default function usePeptideExport() {
    const {
        ecOntology,
        goOntology,
        iprOntology,
        ncbiOntology
    } = useOntologyStore();


    const generateExport = async (
        analysis: SingleAnalysisStore,
        separator = ";"
    ): Promise<string[][]> => {
        const [indexBuffer, dataBuffer] = analysis.peptideToData!.getBuffers();

        console.log(goOntology);

        const workerInput: PeptideExportData = {
            peptideTable: toRaw(analysis.peptidesTable!),
            goOntology: toRaw(goOntology),
            ecOntology: toRaw(ecOntology),
            iprOntology: toRaw(iprOntology),
            ncbiOntology: toRaw(ncbiOntology),
            indexBuffer,
            dataBuffer,
            separator
        };

        const { post } = useAsyncWebWorker<PeptideExportData, string[][]>(() => new PeptideExportProcessorWorker());

        return await post(workerInput);
    }

    return {
        generateExport
    }
}
