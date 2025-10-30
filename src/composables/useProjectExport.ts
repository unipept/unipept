import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import ProjectWorkerWebWorker from "./workers/projectExportWorker.worker?worker&inline";
import {ProjectAnalysisStore, ProjectAnalysisStoreImport} from "@/store/ProjectAnalysisStore";
import {AppStateStore, AppStateStoreImport} from "@/store/AppStateStore";

export interface ProjectExportData {
    project: ProjectAnalysisStoreImport;
    appState: AppStateStoreImport;
}

export interface ProjectExportWorkerOutput {
    content: Blob;
}

export default function useProjectExport() {
    const { post } = useAsyncWebWorker<ProjectExportData, ProjectExportWorkerOutput>(
        () => new ProjectWorkerWebWorker()
    );

    const process = async (project: ProjectAnalysisStore, appState: AppStateStore) => {
        const data = project.exportStore();
        const appStateData = appState.exportStore();
        return await post({ project: data, appState: appStateData });
    };

    return {
        process
    };
}
