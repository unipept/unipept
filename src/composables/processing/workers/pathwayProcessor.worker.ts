import { aggregatePathways } from "./pathwayProcessor";

self.onunhandledrejection = (event) => {
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(aggregatePathways(event.data));
};
