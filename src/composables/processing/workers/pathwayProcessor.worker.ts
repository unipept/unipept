import { aggregatePathways } from "@/logic/processors/pathway/PathwayAggregation";

self.onunhandledrejection = (event) => {
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(aggregatePathways(event.data));
};
