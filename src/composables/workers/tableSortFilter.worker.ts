import { sortFilterTable } from "@/logic/processors/table/TableSortFilter";

self.onunhandledrejection = (event) => {
    throw event.reason;
};

self.onmessage = (event) => {
    self.postMessage(sortFilterTable(event.data));
};
