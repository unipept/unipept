import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import ProjectWorkerWebWorker from "./workers/projectWorker.worker?worker&inline";
import {ProjectAnalysisStore, ProjectAnalysisStoreImport} from "@/store/ProjectAnalysisStore";
import JSZip from "jszip";

export interface ProjectExportData {
    project: ProjectAnalysisStoreImport;
}

export interface ProjectExportWorkerOutput {
    content: Blob;
}

export default function useProjectExport() {
    const { post } = useAsyncWebWorker<ProjectExportData, ProjectExportWorkerOutput>(
        () => new ProjectWorkerWebWorker()
    );

    const process = async (project: ProjectAnalysisStore) => {
        const { content } = await post({ project: project.exportStore() });
        return content;
    };

    return {
        process
    };
}
