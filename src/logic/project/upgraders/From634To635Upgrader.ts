import type JSZip from "jszip";
import type { ProjectUpgrader } from "@/logic/project/ProjectUpgrader";
import { SemVer } from "@/logic/project/SemVer";
import { ShareableMap, type TransferableState } from "shared-memory-datastructures";
import PeptideDataV1 from "@/logic/ontology/peptides/PeptideDataV1";
import PeptideDataV2 from "@/logic/ontology/peptides/PeptideDataV2";
import PeptideDataSerializerV2 from "@/logic/ontology/peptides/PeptideDataSerializerV2";
import { ArrayBufferUtils } from "@/logic/utils/ArrayBufferUtils";
import PeptideDataSerializerV1 from "@/logic/ontology/peptides/PeptideDataSerializerV1";

/**
 * Upgrades a project exported with version 6.3.4 to the 6.3.5 schema.
 * 
 * Between version 6.3.4 of Unipept and 6.3.5, we've fixed a bug in the binary PeptideData format that could
 * cause issues in the future if the amount of lineage ranks changes. This upgrader ensures that projects
 * created with version 6.3.4 are updated to reflect this fix.
 * 
 * Essentially, we need to convert all PeptideDataV1 objects to PeptideDataV2 objects by re-encoding their
 * data buffers with the correct structure.
 * 
 * @author Pieter Verschaffelt
 */
export class From634To635Upgrader implements ProjectUpgrader {
    public readonly name = "From 6.3.4 to 6.3.5";

    public async canUpgrade(zippedProject: JSZip): Promise<boolean> {
        const metadataFile = zippedProject.file("metadata.json");

        if (!metadataFile) {
            throw new Error("Failed to find metadata.json while determining upgrade eligibility.");
        }

        const metadata = JSON.parse(await metadataFile.async("string")) as { version?: string };

        if (!metadata.version) {
            throw new Error("Project version is missing in metadata.json. Unable to determine upgrade eligibility.");
        }

        // This is the first upgrader in the chain, so it should handle any
        // project whose version is older than or equal to 6.3.4.
        return SemVer.compare(metadata.version, "6.3.4") <= 0;
    }

    public async upgrade(zippedProject: JSZip): Promise<JSZip> {
        const buffersFolder = zippedProject.folder("buffers");

        if (!buffersFolder) {
            throw new Error("Failed to find buffers folder while upgrading project from 6.3.4 to 6.3.5.");
        }

        const metadataFile = zippedProject.file("metadata.json");
        if (!metadataFile) {
            throw new Error("Failed to find metadata.json while upgrading project from 6.3.4 to 6.3.5.");
        }

        const metadata = JSON.parse(await metadataFile.async("string")) as {
            groups: Array<{
                analyses: Array<{ id: string }>;
            }>;
        };

        for (const group of metadata.groups) {
            for (const analysis of group.analyses) {
                const indexFile = buffersFolder.file(`${analysis.id}.index`);
                const dataFile = buffersFolder.file(`${analysis.id}.data`);

                if (!indexFile || !dataFile) {
                    // If either buffer is missing, this project export is inconsistent.
                    throw new Error(`Failed to find peptide data buffers for analysis '${analysis.id}' while upgrading project from 6.3.4 to 6.3.5.`);
                }

                const indexArrayBuffer = await indexFile.async("arraybuffer");
                const dataArrayBuffer = await dataFile.async("arraybuffer");

                const indexShared = ArrayBufferUtils.arrayBufferToShared(indexArrayBuffer);
                const dataShared = ArrayBufferUtils.arrayBufferToShared(dataArrayBuffer);

                const transferableState: TransferableState = {
                    indexBuffer: indexShared,
                    dataBuffer: dataShared
                };

                const oldMap = ShareableMap.fromTransferableState<string, PeptideDataV1>(
                    transferableState,
                    { serializer: new PeptideDataSerializerV1() }
                );

                const newMap = new ShareableMap<string, PeptideDataV2>({ serializer: new PeptideDataSerializerV2() });

                for (const [peptide, v1] of oldMap) {
                    const response = v1.toPeptideDataResponse();
                    console.log(response);
                    const v2 = PeptideDataV2.createFromPeptideDataResponse(response);
                    newMap.set(peptide, v2);
                }

                const newTransferable = newMap.toTransferableState();

                // Convert the new SharedArrayBuffers back to regular ArrayBuffers for storage in the zip.
                const newIndexArray = new Uint8Array(newTransferable.indexBuffer as SharedArrayBuffer);
                const newDataArray = new Uint8Array(newTransferable.dataBuffer as SharedArrayBuffer);

                const newIndexArrayBuffer = newIndexArray.slice().buffer;
                const newDataArrayBuffer = newDataArray.slice().buffer;

                buffersFolder.file(`${analysis.id}.index`, newIndexArrayBuffer, { binary: true });
                buffersFolder.file(`${analysis.id}.data`, newDataArrayBuffer, { binary: true });
            }
        }

        // Update the metadata version of this project to 6.3.5
        const updatedMetadata = JSON.parse(await metadataFile.async("string"));
        updatedMetadata.version = "6.3.5";
        zippedProject.file("metadata.json", JSON.stringify(updatedMetadata));

        return zippedProject;
    }
}
