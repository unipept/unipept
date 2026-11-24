import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import FunctionalProcessorWebWorker from "../workers/functionalProcessor.worker.ts?worker";
import type { FunctionalProcessorData, FunctionalProcessorOutput } from "@/logic/processors/functional/FunctionalAggregation";

export default function useFunctionalProcessor() {
    const {post} = useAsyncWebWorker<FunctionalProcessorData, FunctionalProcessorOutput>(
        () => new FunctionalProcessorWebWorker()
    );

    return {
        process: post
    }
}
