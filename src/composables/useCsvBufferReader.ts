import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import CsvReaderWebWorker from "./workers/csvBufferReader.worker.ts?worker";

export interface CsvBufferReaderData {
    file: File
}

export interface CsvBufferReaderWorkerOutput {
    buffer: Uint8Array,
    delimiter: string
}

export default function useCsvBufferReader() {
    const { post } = useAsyncWebWorker<File, string>(
        () => new CsvReaderWebWorker()
    );

    const readCsvFile = async function (file: File): Promise<CsvBufferReaderWorkerOutput> {
        return post(file);
    }

    return {
        readCsvFile
    }
}
