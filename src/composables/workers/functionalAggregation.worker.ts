import { aggregateFunctions } from "@/logic/processors/functional/FunctionalAggregation";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await aggregateFunctions(event.data));
}
