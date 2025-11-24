import JSZip from "jszip";
import { ProjectImportData, SerializedStateData } from "@/composables/useProjectImport";
import { AppStateStoreImport } from "@/store/AppStateStore";
import { ProjectUpgradeManager, VersionedProject } from "@/logic/ProjectUpgradeManager";
import { ProjectAnalysisStoreImport } from "@/store/ProjectAnalysisStore";
import { TransferableState } from "shared-memory-datastructures";

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

const process = async({ input }: ProjectImportData): Promise<SerializedStateData> => {
    const zipper = await JSZip.loadAsync(input);

    const metadataFile = zipper.file("metadata.json");

    if (!metadataFile) {
        throw new Error("Failed to find metadata file");
    }

    const metadata = JSON.parse(await metadataFile.async("string")) as ProjectAnalysisStoreImport & VersionedProject;

    // If the user is trying to import an older Unipept project, we need to upgrade it here.
    const projectUpgradeManager = new ProjectUpgradeManager();
    const upgradedProject = projectUpgradeManager.upgradeIfNeeded(metadata) as ProjectAnalysisStoreImport;

    const buffers = zipper.folder("buffers");

    if (!buffers) {
        throw new Error("Failed to find buffers folder");
    }

    for (const group of upgradedProject.groups) {
        for (const analysis of group.analyses) {
            // Update the buffer assignments
            const indexBuffer = arrayBufferToShared(await buffers.file(`${analysis.id}.index`)?.async("arraybuffer") || undefined);
            const dataBuffer = arrayBufferToShared(await buffers.file(`${analysis.id}.data`)?.async("arraybuffer") || undefined);

            if (indexBuffer && dataBuffer) {
                analysis.peptideToDataTransferable = {
                    indexBuffer: indexBuffer as SharedArrayBuffer,
                    dataBuffer: dataBuffer as SharedArrayBuffer
                } as TransferableState;
            } else {
                analysis.peptideToDataTransferable = undefined;
            }
        }
    }

    const appStateFile = zipper.file("appstate.json");

    let appState: AppStateStoreImport;
    if (appStateFile) {
        appState = JSON.parse(await appStateFile.async("string"));
        console.log(appState);
    } else {
        // Set appState to default values
        appState = {
            selectedComparativeAnalysisIds: [],
            selectedComparativeGroupId: undefined,
            selectedSingleAnalysisIds: [],
            selectedSingleGroupId: undefined
        }
    }

    return {
        project: upgradedProject,
        appState: appState
    };
}