import {CsvBufferReaderWorkerOutput} from "@/composables/useCsvBufferReader";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async (file: File): Promise<CsvBufferReaderWorkerOutput> => {
    const content = await file.text();
    const delimiter = detectDelimiter(content);

    return {
        buffer: new TextEncoder().encode(content),
        delimiter,
    }
};

const detectDelimiter = (line: string): string | null => {
    // Possible delimiters to test
    const delimiters = [",", ";", "\t"];

    // Count the occurrences of each delimiter
    const counts = delimiters.map(delimiter => ({
        delimiter,
        count: (line.match(new RegExp(`\\${delimiter}`, "g")) || []).length,
    }));

    // Find the delimiter with the highest count
    const bestMatch = counts.reduce((max, current) =>
        current.count > max.count ? current : max
    );

    // Return the best match if any delimiter was detected, otherwise null
    return bestMatch.count > 0 ? bestMatch.delimiter : null;
};
