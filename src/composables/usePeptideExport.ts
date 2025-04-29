import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import useOntologyStore from "@/store/OntologyStore";
import {NcbiTaxon} from "@/logic/ontology/taxonomic/Ncbi";
import PeptideExportProcessorWorker from "@/composables/processing/workers/peptideExportProcessor.worker.ts?worker";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import {toRaw} from "vue";
import {FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";
import {EcNamespace} from "@/logic/communicators/unipept/functional/EcResponse";
import {InterproNamespace} from "@/logic/communicators/unipept/functional/InterproResponse";
import {GoNamespace} from "@/logic/communicators/unipept/functional/GoResponse";


export interface PeptideExportData {
    peptideTable: Map<string, number>;
    goOntology: Map<string, FunctionalDefinition<GoNamespace>>;
    ecOntology: Map<string, FunctionalDefinition<EcNamespace>>;
    iprOntology: Map<string, FunctionalDefinition<InterproNamespace>>;
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
