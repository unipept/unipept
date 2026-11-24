import { highlightTree } from "@/logic/processors/taxonomic/HighlightedTree";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await highlightTree(event.data));
};
