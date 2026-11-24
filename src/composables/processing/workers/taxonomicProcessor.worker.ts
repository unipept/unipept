import { aggregateTaxa } from "./taxonomicProcessor";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await aggregateTaxa(event.data));
}
