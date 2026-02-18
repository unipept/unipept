
import { process } from "../ColumnFileParser";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    // @ts-ignore
    self.postMessage(await process(event.data));
}

