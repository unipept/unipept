import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import FunctionalAggregationWorker from "@/composables/workers/functionalAggregation.worker.ts?worker";
import type { FunctionalAggregationInput, FunctionalAggregationOutput } from "@/logic/processors/functional/FunctionalAggregation";

export default function useFunctionalProcessor() {
    const {post} = useAsyncWebWorker<FunctionalAggregationInput, FunctionalAggregationOutput>(
        () => new FunctionalAggregationWorker()
    );

    return {
        process: post
    }
}
