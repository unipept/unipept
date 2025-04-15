import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import ProjectWorkerWebWorker from "./workers/projectWorker.worker?worker&inline";
import {GroupAnalysisStore, GroupAnalysisStoreImport} from "@/store/new/GroupAnalysisStore";

export interface ProjectExportData {
    project: GroupAnalysisStoreImport;
}

export interface ProjectExportWorkerOutput {
    json: string;
}

export default function useProjectExport() {
    const { post } = useAsyncWebWorker<ProjectExportData, ProjectExportWorkerOutput>(
        () => new ProjectWorkerWebWorker()
    );

    const process = async (project: GroupAnalysisStoreImport) => {
        const { json } = await post({ project });
        return json;
    };

    return {
        process
    };
}
