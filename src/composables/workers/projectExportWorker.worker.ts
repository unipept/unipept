import {ProjectExportData} from "@/composables/useProjectExport";
import JSZip from "jszip";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async ({ project, appState }: ProjectExportData) => {
    const zipper = new JSZip();

    const buffers = zipper.folder("buffers");

    if (!buffers) {
        throw new Error("Failed to create buffers folder");
    }

    // Store all the buffers in the zip file
    for (const group of project.groups) {
        const analyses = group.analyses;
        for (const analysis of analyses) {
            // Check if the buffers are defined
            if (analysis.peptideToDataTransferable) {
                const transferableMap = analysis.peptideToDataTransferable;

                // Create new ArrayBuffers and copy the data from SharedArrayBuffers
                const indexArray = new Uint8Array(transferableMap.indexBuffer);
                const dataArray = new Uint8Array(transferableMap.dataBuffer);

                // Create regular ArrayBuffers from the TypedArrays
                const indexArrayBuffer = indexArray.slice().buffer;
                const dataArrayBuffer = dataArray.slice().buffer;

                // Write the regular ArrayBuffers to file
                buffers.file(`${analysis.id}.index`, indexArrayBuffer, { binary: true });
                buffers.file(`${analysis.id}.data`, dataArrayBuffer, { binary: true });

            }
        }
    }

    // Clear the buffers from the analyses
    const metadata = {
        groups: project.groups.map(group => ({
            id: group.id,
            name: group.name,
            analyses: group.analyses.map(analysis => {
                analysis.peptideToDataTransferable = undefined;
                return analysis;
            })
        })),
        filters: project.filters,
        version: project.version
    };

    zipper.file("metadata.json", JSON.stringify(metadata));
    zipper.file("appstate.json", JSON.stringify(appState));

    const content = await zipper.generateAsync({ type: "blob" });

    return { content }
};
