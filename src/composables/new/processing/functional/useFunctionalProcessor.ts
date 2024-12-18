import useAsyncWebWorker from "@/composables/new/useAsyncWebWorker";
import FunctionalProcessorWebWorker from "../workers/functionalProcessor.worker.ts?worker&inline";

export interface FunctionalProcessorData {
    peptideCounts: Map<string, number>;
    indexBuffer: ArrayBuffer;
    dataBuffer: ArrayBuffer;
    percentage: number;
    termPrefix: string;
    proteinCountProperty: string;
}

export default function useFunctionalProcessor() {
    const { post } = useAsyncWebWorker(() => new FunctionalProcessorWebWorker());

    const process = post

    return {
        process
    }
}
