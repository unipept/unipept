import useAsyncWebWorker from "@/composables/new/useAsyncWebWorker";

export interface FunctionalProcessorData {
    peptideCounts: Map<string, number>;
    indexBuffer: ArrayBuffer;
    dataBuffer: ArrayBuffer;
    percentage: number;
    termPrefix: string;
    proteinCountProperty: string;
}

export default function useFunctionalProcessor() {
    const { post } = useAsyncWebWorker('./src/composables/new/processing/workers/functionalProcessor.worker.ts');

    const process = post

    return {
        process
    }
}
