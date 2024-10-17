import CountTable from "@/logic/new/CountTable";
import useAsyncWebWorker from "@/composables/new/useAsyncWebWorker";

export interface TaxonomicProcessorData {
    peptideCounts: CountTable<string>;
    indexBuffer: ArrayBuffer;
    dataBuffer: ArrayBuffer;
}

export default function useTaxonomicProcessor() {
    const { post } = useAsyncWebWorker('./src/composables/new/processing/workers/taxonomicProcessor.worker.ts');

    const processCountTable = post;

    const processOntology = async () => {

    };

    const process = post

    return {
        process
    }
}