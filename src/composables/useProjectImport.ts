import {ProjectAnalysisStoreImport} from "@/store/ProjectAnalysisStore";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import ProjectImportWorker from "./workers/projectImportWorker.worker?worker&inline";

export interface ProjectImportData {
    input: File | Blob
}

export default function useProjectImport() {
    const { post } = useAsyncWebWorker<ProjectImportData, ProjectAnalysisStoreImport>(
        () => new ProjectImportWorker()
    );

    const process = async (input: File | Blob): Promise<ProjectAnalysisStoreImport> => {
        return await post({ input })
    }

    return {
        process
    };
}
