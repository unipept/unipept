import JSZip from "jszip";
import {ProjectImportData} from "@/composables/useProjectImport";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const arrayBufferToShared = (buffer: ArrayBuffer | undefined): SharedArrayBuffer | undefined => {
    if (!buffer) return undefined;
    const sharedBuffer = new SharedArrayBuffer(buffer.byteLength);
    new Uint8Array(sharedBuffer).set(new Uint8Array(buffer));
    return sharedBuffer;
};

const process = async({ input }: ProjectImportData) => {
    const zipper = await JSZip.loadAsync(input);

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
            // Update the buffer assignments
            analysis.indexBuffer = arrayBufferToShared(await buffers.file(`${analysis.id}.index`)?.async("arraybuffer") || undefined);
            analysis.dataBuffer = arrayBufferToShared(await buffers.file(`${analysis.id}.data`)?.async("arraybuffer") || undefined);
        }
    }

    return metadata;
}