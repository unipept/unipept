import {ProjectAnalysisStoreImport} from "@/store/ProjectAnalysisStore";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import ProjectImportWorker from "./workers/projectImportWorker.worker?worker&inline";
import {AppStateStoreImport} from "@/store/AppStateStore";

export interface ProjectImportData {
    input: File | Blob
}

export interface SerializedStateData {
    project: ProjectAnalysisStoreImport;
    appState: AppStateStoreImport;
}

export default function useProjectImport() {
    const { post } = useAsyncWebWorker<ProjectImportData, SerializedStateData>(
        () => new ProjectImportWorker()
    );

    const process = async (input: File | Blob): Promise<SerializedStateData> => {
        return await post({ input })
    }

    return {
        process
    };
}
