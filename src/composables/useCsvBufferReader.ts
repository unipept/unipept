import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import CsvReaderWebWorker from "./workers/csvBufferReader.worker.ts?worker";

export interface CsvBufferReaderWorkerOutput {
    buffer: Uint8Array,
    delimiter: string | null
}

export default function useCsvBufferReader() {
    const { post } = useAsyncWebWorker<File, CsvBufferReaderWorkerOutput>(
        () => new CsvReaderWebWorker()
    );

    const readCsvFile = async function (file: File): Promise<CsvBufferReaderWorkerOutput> {
        return await post(file);
    }

    return {
        readCsvFile
    }
}
