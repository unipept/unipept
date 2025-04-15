import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import ProjectWorkerWebWorker from "./workers/projectWorker.worker?worker&inline";
import {GroupAnalysisStore, GroupAnalysisStoreImport} from "@/store/new/GroupAnalysisStore";
import JSZip from "jszip";

export interface ProjectExportData {
    project: GroupAnalysisStoreImport;
}

export interface ProjectExportWorkerOutput {
    content: Blob;
}

export default function useProjectExport() {
    const { post } = useAsyncWebWorker<ProjectExportData, ProjectExportWorkerOutput>(
        () => new ProjectWorkerWebWorker()
    );

    const process = async (project: GroupAnalysisStore) => {
        const { content } = await post({ project: project.exportStore() });
        return content;
    };

    return {
        process
    };
}
