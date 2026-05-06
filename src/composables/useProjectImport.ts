import {ProjectAnalysisStoreImport} from "@/store/ProjectAnalysisStore";
import ProjectImportWorker from "./workers/projectImportWorker.worker?worker&inline";
import {AppStateStoreImport} from "@/store/AppStateStore";
import {ref, type Ref} from "vue";

export interface ProjectImportData {
    input: File | Blob
}

export interface SerializedStateData {
    project: ProjectAnalysisStoreImport;
    appState: AppStateStoreImport;
}

type WorkerMessage =
    | { type: "status"; message: string }
    | { type: "done"; data: SerializedStateData };

export default function useProjectImport() {
    const status: Ref<string> = ref("");

    const process = async (input: File | Blob): Promise<SerializedStateData> => {
        const worker = new ProjectImportWorker();

        return new Promise((resolve, reject) => {
            worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
                if (event.data.type === "status") {
                    status.value = event.data.message;
                } else {
                    worker.terminate();
                    status.value = "";
                    resolve(event.data.data);
                }
            };

            worker.onerror = (error) => {
                worker.terminate();
                status.value = "";
                reject(error.message);
            };

            worker.postMessage({ input });
        });
    };

    return {
        process,
        status
    };
}
