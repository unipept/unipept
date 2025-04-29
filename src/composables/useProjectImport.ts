import {ProjectAnalysisStoreImport} from "@/store/ProjectAnalysisStore";
import JSZip from "jszip";

export default function useProjectImport() {
    const process = async (file: File | Blob): Promise<ProjectAnalysisStoreImport> => {
        const zipper = await JSZip.loadAsync(file);

        const metadataFile = zipper.file("metadata.json");

        if (!metadataFile) {
            throw new Error("Failed to find metadata file");
        }

        const metadata = JSON.parse(await metadataFile.async("string"));

        const buffers = zipper.folder("buffers");

        if (!buffers) {
            throw new Error("Failed to find buffers folder");
        }

        for (const group of metadata.groups) {
            for (const analysis of group.analyses) {
                analysis.indexBuffer = await buffers.file(`${analysis.id}.index`)?.async("arraybuffer") || undefined;
                analysis.dataBuffer = await buffers.file(`${analysis.id}.data`)?.async("arraybuffer") || undefined;
            }
        }

        return metadata;
    };

    return {
        process
    };
}
