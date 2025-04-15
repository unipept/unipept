import {GroupAnalysisStoreImport} from "@/store/new/GroupAnalysisStore";
import JSZip from "jszip";

export default function useProjectImport() {
    const process = async (file: File): Promise<GroupAnalysisStoreImport> => {
        const zipper = await JSZip.loadAsync(file);

        const metadata = JSON.parse(await zipper.file("metadata.json")?.async("string"));

        const buffers = zipper.folder("buffers");

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
