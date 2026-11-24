import { sortFilterTable } from "./tableSortFilter";

self.onunhandledrejection = (event) => {
    throw event.reason;
};

self.onmessage = (event) => {
    self.postMessage(sortFilterTable(event.data));
};
