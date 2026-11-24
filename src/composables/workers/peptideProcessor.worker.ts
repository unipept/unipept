import { countPeptides } from "@/logic/processors/peptide/PeptideCounts";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await countPeptides(event.data));
}
