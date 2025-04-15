import {ProjectExportData} from "@/components/project/export/useProjectExport";
import JSZip from "jszip";

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async ({ project }: ProjectExportData) => {
    const zipper = new JSZip();

    const buffers = zipper.folder("buffers");

    // Store all the buffers in the zip file
    for (const group of project.groups) {
        const analyses = group.analyses;
        for (const analysis of analyses) {
            // Check if the buffers are defined
            if (analysis.indexBuffer && analysis.dataBuffer) {
                buffers.file(`${analysis.id}.index`, analysis.indexBuffer, { binary: true });
                buffers.file(`${analysis.id}.data`, analysis.dataBuffer, { binary: true });
            }
        }
    }

    // Clear the buffers from the analyses
    const metadata = {
        groups: project.groups.map(group => ({
            id: group.id,
            name: group.name,
            analyses: group.analyses.map(analysis => {
                analysis.indexBuffer = undefined;
                analysis.dataBuffer = undefined;
                return analysis;
            })
        })),
        filters: project.filters
    };

    zipper.file("metadata.json", JSON.stringify(metadata));

    const content = await zipper.generateAsync({ type: "blob" });

    return { content }
};
