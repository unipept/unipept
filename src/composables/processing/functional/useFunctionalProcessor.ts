import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import FunctionalProcessorWebWorker from "@/composables/workers/functionalProcessor.worker.ts?worker";
import type { FunctionalAggregationInput, FunctionalAggregationOutput } from "@/logic/processors/functional/FunctionalAggregation";

export default function useFunctionalProcessor() {
    const {post} = useAsyncWebWorker<FunctionalAggregationInput, FunctionalAggregationOutput>(
        () => new FunctionalProcessorWebWorker()
    );

    return {
        process: post
    }
}
