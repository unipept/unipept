import JSZip from "jszip";
import {ProjectImportData, SerializedStateData} from "@/composables/useProjectImport";
import {AppStateStoreImport} from "@/store/AppStateStore";
import {ProjectUpgradeManager} from "@/logic/project/ProjectUpgradeManager";
import {ProjectAnalysisStoreImport} from "@/store/ProjectAnalysisStore";
import {TransferableState} from "shared-memory-datastructures";
import {ArrayBufferUtils} from "@/logic/utils/ArrayBufferUtils";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async({ input }: ProjectImportData): Promise<SerializedStateData> => {
    let zipper = await JSZip.loadAsync(input);

    // If the user is trying to import an older Unipept project, we need to upgrade it here.
    const projectUpgradeManager = new ProjectUpgradeManager();
    zipper = await projectUpgradeManager.upgradeIfNeeded(zipper);

    const metadataFile = zipper.file("metadata.json");

    if (!metadataFile) {
        throw new Error("Failed to find metadata file");
    }

    const upgradedProject = JSON.parse(await metadataFile.async("string")) as ProjectAnalysisStoreImport;

    const buffers = zipper.folder("buffers");

    if (!buffers) {
        throw new Error("Failed to find buffers folder");
    }

    for (const group of upgradedProject.groups) {
        for (const analysis of group.analyses) {
            const arrayIndexBuffer = await buffers.file(`${analysis.id}.index`)?.async("arraybuffer");
            const arrayDataBuffer = await buffers.file(`${analysis.id}.data`)?.async("arraybuffer");

            if (!arrayIndexBuffer || !arrayDataBuffer) {
                throw new Error(`Failed to load buffers for analysis with id '${analysis.id}'. The project is in an invalid state.`);
            }

            // Update the buffer assignments
            const indexBuffer = ArrayBufferUtils.arrayBufferToShared(arrayIndexBuffer);
            const dataBuffer = ArrayBufferUtils.arrayBufferToShared(arrayDataBuffer);
            

            analysis.peptideToDataTransferable = {
                indexBuffer: indexBuffer as SharedArrayBuffer,
                dataBuffer: dataBuffer as SharedArrayBuffer
            } as TransferableState;
        }
    }

    const appStateFile = zipper.file("appstate.json");

    let appState: AppStateStoreImport;
    if (appStateFile) {
        appState = JSON.parse(await appStateFile.async("string"));
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