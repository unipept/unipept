import type JSZip from "jszip";
import type { ProjectUpgrader } from "@/logic/project/ProjectUpgrader";
import { SemVer } from "@/logic/project/SemVer";
import { ShareableMap, type TransferableState } from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import { ArrayBufferUtils } from "@/logic/utils/ArrayBufferUtils";
import {Serializable} from "shared-memory-datastructures";
import PeptideDataResponse from "@/logic/ontology/peptides/PeptideDataResponse";


/**
 * Upgrades a project exported with version 6.3.4 to the 6.3.5 schema.
 * 
 * Between version 6.3.4 of Unipept and 6.3.5, we've fixed a bug in the binary PeptideData format that could
 * cause issues in the future if the amount of lineage ranks changes. This upgrader ensures that projects
 * created with version 6.3.4 are updated to reflect this fix.
 * 
 * Essentially, we need to convert all PeptideDataV1 objects to PeptideData objects by re-encoding their
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

                const oldMap = ShareableMap.fromTransferableState<string, PeptideData_v6_3_4>(
                    transferableState,
                    { serializer: new PeptideDataSerializer_v6_3_4() }
                );

                const newMap = new ShareableMap<string, PeptideData>({ serializer: new PeptideDataSerializer() });

                for (const [peptide, v1] of oldMap) {
                    const response = v1.toPeptideDataResponse();
                    const v2 = PeptideData.createFromPeptideDataResponse(response);
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

        const updatedMetadata = JSON.parse(await metadataFile.async("string"));

        // Update the metadata version of this project to 6.3.5
        updatedMetadata.version = "6.3.5";

        // Update the config of this project (disable useCrap, as it was not present in earlier versions)
        for (const group of updatedMetadata.groups) {
            for (const analysis of group.analyses) {
                analysis.config.useCrap = false;
            }
        }

        zippedProject.file("metadata.json", JSON.stringify(updatedMetadata));

        return zippedProject;
    }
}


/**
 * Version 1 of the binary PeptideData format that has been used until Unipept v6.3.4. This format is kept here for
 * compatibility purposes.
 */
export class PeptideData_v6_3_4 {
    // Offsets and lengths of the data fields in bytes.
    public static readonly LCA_OFFSET: number = 0;
    public static readonly LCA_SIZE: number = 4;

    // At what position in the array does the lineage array start.
    public static readonly LINEAGE_OFFSET: number = PeptideData_v6_3_4.LCA_OFFSET + PeptideData_v6_3_4.LCA_SIZE;
    public static readonly RANK_COUNT: number = 28;
    // 28 NCBI ranks at this moment (TODO should not be hardcoded)
    public static readonly LINEAGE_SIZE: number = 4 * PeptideData_v6_3_4.RANK_COUNT;

    // How many bytes are reserved for the counts of each functional annotation type?
    public static readonly FA_COUNT_SIZE = 4;

    // At what offset in the array do the functional annotation counts start?
    public static readonly FA_ALL_COUNT_OFFSET = PeptideData_v6_3_4.LINEAGE_OFFSET + PeptideData_v6_3_4.LINEAGE_SIZE;
    public static readonly FA_EC_COUNT_OFFSET = PeptideData_v6_3_4.FA_ALL_COUNT_OFFSET + PeptideData_v6_3_4.FA_COUNT_SIZE;
    public static readonly FA_GO_COUNT_OFFSET = PeptideData_v6_3_4.FA_EC_COUNT_OFFSET + PeptideData_v6_3_4.FA_COUNT_SIZE;
    public static readonly FA_IPR_COUNT_OFFSET = PeptideData_v6_3_4.FA_GO_COUNT_OFFSET + PeptideData_v6_3_4.FA_COUNT_SIZE;

    // How many bytes are reserved for a pointer to the different start positions in the data portion of the array?
    public static readonly FA_POINTER_SIZE = 4;

    // Where does the data portion start in the array?
    public static readonly FA_EC_INDEX_OFFSET = PeptideData_v6_3_4.FA_IPR_COUNT_OFFSET + PeptideData_v6_3_4.FA_COUNT_SIZE;
    public static readonly FA_GO_INDEX_OFFSET = PeptideData_v6_3_4.FA_EC_INDEX_OFFSET + PeptideData_v6_3_4.FA_POINTER_SIZE;
    public static readonly FA_IPR_INDEX_OFFSET = PeptideData_v6_3_4.FA_GO_INDEX_OFFSET + PeptideData_v6_3_4.FA_POINTER_SIZE;
    public static readonly FA_DATA_START = PeptideData_v6_3_4.FA_IPR_INDEX_OFFSET + PeptideData_v6_3_4.FA_POINTER_SIZE;

    // How many bytes do we reserve to keep track of the length of the taxon array?
    public static readonly TAXON_COUNT_SIZE = 4;

    // How many bytes do we reserve to represent each taxon ID?
    public static readonly TAXON_SIZE = 4;

    public get TAXA_START() {
        let goStart = this.dataView.getUint32(PeptideData_v6_3_4.FA_GO_INDEX_OFFSET);
        const goLength = this.dataView.getUint32(goStart);

        let ecStart = this.dataView.getUint32(PeptideData_v6_3_4.FA_EC_INDEX_OFFSET);
        const ecLength = this.dataView.getUint32(ecStart);

        let iprStart = this.dataView.getUint32(PeptideData_v6_3_4.FA_IPR_INDEX_OFFSET);
        const iprLength = this.dataView.getUint32(iprStart);

        const faDataLength = 12 + goLength * 8 + iprLength * 8 + ecLength * 20;
        return PeptideData_v6_3_4.FA_DATA_START + faDataLength;
    }


    constructor(
        public readonly dataView: DataView
    ) {}

    public static createFromPeptideDataResponse(response: PeptideDataResponse): PeptideData_v6_3_4 {
        const gos = response.fa.data ? Object.keys(response.fa.data).filter(
            code => code.startsWith("GO:")
        ) : [];
        const iprs = response.fa.data ? Object.keys(response.fa.data).filter(
            code => code.startsWith("IPR:")
        ) : [];
        const ecs = response.fa.data ? Object.keys(response.fa.data).filter(
            code => code.startsWith("EC:")
        ) : [];

        // We need 12 bytes to record the length of each of the functional annotation arrays.
        // GO is stored as an integer (4 bytes) and it's count (4 bytes for count)
        // IPR is stored as an integer (4 bytes) and it's count (4 bytes)
        // EC is stored as 4 integers (4 bytes) and it's count (4 bytes)
        const faDataLength = 12 + gos.length * 8 + iprs.length * 8 + ecs.length * 20;

        const taxaStart = PeptideData_v6_3_4.FA_DATA_START + faDataLength;
        const bufferLength = taxaStart + PeptideData_v6_3_4.TAXON_COUNT_SIZE + (response.taxa?.length || 0) * PeptideData_v6_3_4.TAXON_SIZE;

        const dataBuffer = new ArrayBuffer(bufferLength);

        // Now convert all the data into a binary format
        const dataView = new DataView(dataBuffer);
        dataView.setUint32(this.LCA_OFFSET, response.lca);

        // Copy the lineage array
        for (let i = 0; i < response.lineage.length; i++) {
            dataView.setInt32(this.LINEAGE_OFFSET + i * 4, response.lineage[i]!);
        }

        dataView.setUint32(this.FA_ALL_COUNT_OFFSET, response.fa.counts.all);
        dataView.setUint32(this.FA_GO_COUNT_OFFSET, response.fa.counts.GO);
        dataView.setUint32(this.FA_IPR_COUNT_OFFSET, response.fa.counts.IPR);
        dataView.setUint32(this.FA_EC_COUNT_OFFSET, response.fa.counts.EC);

        // First convert EC-numbers to binary format
        // Keep track of where the EC-numbers encoding starts.
        dataView.setUint32(this.FA_EC_INDEX_OFFSET, this.FA_DATA_START);
        let currentPos = this.FA_DATA_START;
        // Keep track of how many EC-numbers are encoded.
        dataView.setUint32(currentPos, ecs.length);
        currentPos += 4;
        for (const ec of ecs) {
            const parts = ec.replace("EC:", "").split(".");
            // Encode null-values as -1
            dataView.setInt32(currentPos, parts[0] !== "-" ? parseInt(parts[0]) : -1);
            dataView.setInt32(currentPos + 4, parts[1] !== "-" ? parseInt(parts[1]) : -1);
            dataView.setInt32(currentPos + 8, parts[2] !== "-" ? parseInt(parts[2]) : -1);
            dataView.setInt32(currentPos + 12, parts[3] !== "-" ? parseInt(parts[3]) : -1);
            dataView.setUint32(currentPos + 16, response.fa.data[ec]);
            currentPos += 20;
        }

        // Now convert GO-terms to binary format
        // Keep track of where the GO-terms encoding starts.
        dataView.setUint32(this.FA_GO_INDEX_OFFSET, currentPos);
        // Keep track of how many GO-terms are encoded.
        dataView.setUint32(currentPos, gos.length);
        currentPos += 4;
        for (const go of gos) {
            dataView.setUint32(currentPos, parseInt(go.replace("GO:", "")));
            dataView.setUint32(currentPos + 4, response.fa.data[go]);
            currentPos += 8;
        }

        // Now convert IPR-terms to binary format
        // Keep track of where the IPR-terms encoding starts.
        dataView.setUint32(this.FA_IPR_INDEX_OFFSET, currentPos);
        // Keep track of how many IPR-terms are encoded.
        dataView.setUint32(currentPos, iprs.length);
        currentPos += 4;
        for (const ipr of iprs) {
            dataView.setUint32(currentPos, parseInt(ipr.replace("IPR:IPR", "")));
            dataView.setUint32(currentPos + 4, response.fa.data[ipr]);
            currentPos += 8;
        }

        // Keep track of how many taxa there are stored in this object
        dataView.setUint32(taxaStart, response.taxa?.length || 0);
        currentPos = taxaStart + PeptideData_v6_3_4.TAXON_COUNT_SIZE;
        // Store the actual taxa IDs
        for (const taxon of response.taxa || []) {
            dataView.setUint32(currentPos, taxon);
            currentPos += PeptideData_v6_3_4.TAXON_SIZE;
        }

        return new PeptideData_v6_3_4(dataView);
    }

    public get faCounts(): { all: number, ec: number, go: number, ipr: number } {
        return {
            all: this.dataView.getUint32(PeptideData_v6_3_4.FA_ALL_COUNT_OFFSET),
            ec: this.dataView.getUint32(PeptideData_v6_3_4.FA_EC_COUNT_OFFSET),
            go: this.dataView.getUint32(PeptideData_v6_3_4.FA_GO_COUNT_OFFSET),
            ipr: this.dataView.getUint32(PeptideData_v6_3_4.FA_IPR_COUNT_OFFSET)
        }
    }

    public get lca(): number {
        return this.dataView.getUint32(PeptideData_v6_3_4.LCA_OFFSET);
    }

    public get lineage(): number[] {
        const lin = [];
        for (let i = 0; i < PeptideData_v6_3_4.RANK_COUNT; i++) {
            const val = this.dataView.getInt32(PeptideData_v6_3_4.LINEAGE_OFFSET + i * 4);
            if(val != null) {
                lin.push(val);
            }
        }
        return lin;
    }

    public get ec(): any {
        const output = {};

        let ecStart = this.dataView.getUint32(PeptideData_v6_3_4.FA_EC_INDEX_OFFSET);
        const ecLength = this.dataView.getUint32(ecStart);

        ecStart += 4;

        // Decode each of the EC numbers
        for (let i = 0; i < ecLength; i++) {
            const part1 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart));
            const part2 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart + 4));
            const part3 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart + 8));
            const part4 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart + 12));

            // @ts-ignore: variable indexing
            output[`EC:${part1}.${part2}.${part3}.${part4}`] = this.dataView.getUint32(ecStart + 16);

            ecStart += 20;
        }

        return output;
    }

    private encodedNullOrNumberToString(value: number): string {
        if (value === -1) {
            return "-";
        } else {
            return value.toString();
        }
    }

    public get go(): any {
        const output = {};

        let goStart = this.dataView.getUint32(PeptideData_v6_3_4.FA_GO_INDEX_OFFSET);
        const goLength = this.dataView.getUint32(goStart);

        goStart += 4;

        // Decode each of the GO terms
        for (let i = 0; i < goLength; i++) {
            const term = this.dataView.getUint32(goStart);

            // @ts-ignore: variable indexing
            output[
            "GO:" + leftPad(term.toString(), "0", 7)
                ] = this.dataView.getUint32(goStart + 4);

            goStart += 8;
        }

        return output;
    }

    public get ipr(): any {
        const output = {};

        let iprStart = this.dataView.getUint32(PeptideData_v6_3_4.FA_IPR_INDEX_OFFSET);
        const iprLength = this.dataView.getUint32(iprStart);

        iprStart += 4;

        // Decode each of the GO terms
        for (let i = 0; i < iprLength; i++) {
            const term = this.dataView.getUint32(iprStart);

            // @ts-ignore: variable indexing
            output[
            "IPR:IPR" + leftPad(term.toString(), "0", 6)
                ] = this.dataView.getUint32(iprStart + 4);

            iprStart += 8;
        }

        return output;
    }

    public get taxa(): number[] {
        const output = [];

        const taxaLength = this.dataView.getUint32(this.TAXA_START);

        for (let i = 0; i < taxaLength; i++) {
            output.push(this.dataView.getUint32(this.TAXA_START + PeptideData_v6_3_4.TAXON_COUNT_SIZE + i * PeptideData_v6_3_4.TAXON_SIZE));
        }

        return output;
    }

    public toPeptideDataResponse(): PeptideDataResponse {
        const faCounts = this.faCounts;

        const dataObject = {};
        Object.assign(dataObject, this.go);
        Object.assign(dataObject, this.ec);
        Object.assign(dataObject, this.ipr);

        return {
            lca: this.lca,
            lineage: this.lineage,
            fa: {
                counts: {
                    all: faCounts.all,
                    EC: faCounts.ec,
                    GO: faCounts.go,
                    IPR: faCounts.ipr
                },
                data: dataObject
            },
            taxa: this.taxa,
        }
    }
}

const leftPad = (str: string, character: string, len: number): string => {
    const numberOfChars = len - str.length;
    let chars = "";
    for (let i = 0; i < numberOfChars; i++) {
        chars += character;
    }
    return chars + str;
}

export class PeptideDataSerializer_v6_3_4 implements Serializable<PeptideData_v6_3_4> {
    public decode(buffer: Uint8Array): PeptideData_v6_3_4 {
        return new PeptideData_v6_3_4(new DataView(buffer.buffer));
    }

    public encode(object: PeptideData_v6_3_4, destination: Uint8Array): number {
        const destinationView = new DataView(destination.buffer, destination.byteOffset, destination.byteLength);
        for (let i = 0; i < object.dataView.byteLength; i++) {
            destinationView.setUint8(i, object.dataView.getUint8(i));
        }
        return object.dataView.byteLength;
    }

    public maximumLength(object: PeptideData_v6_3_4): number {
        return object.dataView.byteLength;
    }
}

