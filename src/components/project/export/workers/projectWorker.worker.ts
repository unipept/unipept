import {GroupAnalysisStoreImport} from "@/store/new/GroupAnalysisStore";
import {ProjectExportData} from "@/components/project/export/useProjectExport";

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async ({ project }: ProjectExportData) => {
    return {
        json: JSON.stringify(project)
    }
};
