import type JSZip from "jszip";
import type { ProjectUpgrader } from "@/logic/project/ProjectUpgrader";
import { SemVer } from "@/logic/project/SemVer";
import { ShareableMap, type TransferableState } from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import { ArrayBufferUtils } from "@/logic/utils/ArrayBufferUtils";
import { Serializable } from "shared-memory-datastructures";
import PeptideDataResponse from "@/logic/ontology/peptides/PeptideDataResponse";
import { DEFAULT_API_BASE_URL, DEFAULT_BATCH_SIZE } from "@/logic/Constants";


/**
 * Upgrades a project exported with version ≤ 6.5.0 to the 6.5.1 schema.
 *
 * Between 6.5.0 and 6.5.1 a `cutoff_used` flag was added to the binary
 * PeptideData format (1 byte at offset 40). Projects created before this
 * change lack that byte; the upgrader re-encodes every PeptideData entry and
 * back-fills the flag: true when fa.counts.all > 9000, false otherwise.
 *
 * @author Pieter Verschaffelt
 */
export class From640To651Upgrader implements ProjectUpgrader {
    public readonly name = "From 6.4.0 to 6.5.1";

    public async canUpgrade(zippedProject: JSZip): Promise<boolean> {
        const metadataFile = zippedProject.file("metadata.json");

        if (!metadataFile) {
            throw new Error("Failed to find metadata.json while determining upgrade eligibility.");
        }

        const metadata = JSON.parse(await metadataFile.async("string")) as { version?: string };

        if (!metadata.version) {
            throw new Error("Project version is missing in metadata.json. Unable to determine upgrade eligibility.");
        }

        return SemVer.compare(metadata.version, "6.5.0") <= 0;
    }

    public async upgrade(zippedProject: JSZip): Promise<JSZip> {
        const buffersFolder = zippedProject.folder("buffers");

        if (!buffersFolder) {
            throw new Error("Failed to find buffers folder while upgrading project from 6.4.0 to 6.5.1.");
        }

        const metadataFile = zippedProject.file("metadata.json");
        if (!metadataFile) {
            throw new Error("Failed to find metadata.json while upgrading project from 6.4.0 to 6.5.1.");
        }

        const metadata = JSON.parse(await metadataFile.async("string")) as {
            groups: Array<{
                analyses: Array<{ id: string; config: { equate: boolean } }>;
            }>;
        };

        for (const group of metadata.groups) {
            for (const analysis of group.analyses) {
                const indexFile = buffersFolder.file(`${analysis.id}.index`);
                const dataFile = buffersFolder.file(`${analysis.id}.data`);

                if (!indexFile || !dataFile) {
                    throw new Error(`Failed to find peptide data buffers for analysis '${analysis.id}' while upgrading project from 6.4.0 to 6.5.1.`);
                }

                const indexArrayBuffer = await indexFile.async("arraybuffer");
                const dataArrayBuffer = await dataFile.async("arraybuffer");

                const indexShared = ArrayBufferUtils.arrayBufferToShared(indexArrayBuffer);
                const dataShared = ArrayBufferUtils.arrayBufferToShared(dataArrayBuffer);

                const transferableState: TransferableState = {
                    indexBuffer: indexShared,
                    dataBuffer: dataShared
                };

                const oldMap = ShareableMap.fromTransferableState<string, PeptideData_v6_4_0>(
                    transferableState,
                    { serializer: new PeptideDataSerializer_v6_4_0() }
                );

                const sequences = Array.from(oldMap.keys());
                const crapFilteredMap = await this.fetchCrapFiltered(sequences, analysis.config.equate);

                const newMap = new ShareableMap<string, PeptideData>({ serializer: new PeptideDataSerializer() });

                for (const [peptide, old] of oldMap) {
                    const response = old.toPeptideDataResponse();
                    response.cutoff_used = response.fa.counts.all > 9000;
                    response.crap_filtered = crapFilteredMap.get(peptide) ?? false;
                    newMap.set(peptide, PeptideData.createFromPeptideDataResponse(response));
                }

                const newTransferable = newMap.toTransferableState();

                const newIndexArray = new Uint8Array(newTransferable.indexBuffer as SharedArrayBuffer);
                const newDataArray = new Uint8Array(newTransferable.dataBuffer as SharedArrayBuffer);

                buffersFolder.file(`${analysis.id}.index`, newIndexArray.slice().buffer, { binary: true });
                buffersFolder.file(`${analysis.id}.data`, newDataArray.slice().buffer, { binary: true });
            }
        }

        const updatedMetadata = JSON.parse(await metadataFile.async("string"));
        updatedMetadata.version = "6.5.1";
        zippedProject.file("metadata.json", JSON.stringify(updatedMetadata));

        return zippedProject;
    }

    private async fetchCrapFiltered(sequences: string[], equate: boolean): Promise<Map<string, boolean>> {
        const result = new Map<string, boolean>();

        for (let i = 0; i < sequences.length; i += DEFAULT_BATCH_SIZE) {
            const batch = sequences.slice(i, i + DEFAULT_BATCH_SIZE);
            const response = await fetch(`${DEFAULT_API_BASE_URL}/mpa/pept2data`, {
                method: "POST",
                body: JSON.stringify({
                    peptides: batch,
                    equate_il: equate,
                    report_taxa: false
                }),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json());

            for (const peptide of response.peptides ?? []) {
                result.set(peptide.sequence, peptide.crap_filtered ?? false);
            }
        }

        return result;
    }
}


/**
 * Snapshot of the binary PeptideData format used from Unipept v6.4.0 up to
 * and including v6.5.0. DATA_START is at byte 40 (no cutoff_used byte).
 */
export class PeptideData_v6_4_0 {
    public static readonly LCA_OFFSET: number = 0;
    public static readonly LCA_SIZE: number = 4;

    public static readonly LINEAGE_COUNT_OFFSET: number = PeptideData_v6_4_0.LCA_OFFSET + PeptideData_v6_4_0.LCA_SIZE;
    public static readonly LINEAGE_COUNT_SIZE: number = 4;
    public static readonly LINEAGE_ARRAY_INDEX_OFFSET: number = PeptideData_v6_4_0.LINEAGE_COUNT_OFFSET + PeptideData_v6_4_0.LINEAGE_COUNT_SIZE;
    public static readonly LINEAGE_ARRAY_POINTER_SIZE: number = 4;

    public static readonly FA_COUNT_SIZE = 4;

    public static readonly FA_ALL_COUNT_OFFSET = PeptideData_v6_4_0.LINEAGE_ARRAY_INDEX_OFFSET + PeptideData_v6_4_0.LINEAGE_ARRAY_POINTER_SIZE;
    public static readonly FA_EC_COUNT_OFFSET = PeptideData_v6_4_0.FA_ALL_COUNT_OFFSET + PeptideData_v6_4_0.FA_COUNT_SIZE;
    public static readonly FA_GO_COUNT_OFFSET = PeptideData_v6_4_0.FA_EC_COUNT_OFFSET + PeptideData_v6_4_0.FA_COUNT_SIZE;
    public static readonly FA_IPR_COUNT_OFFSET = PeptideData_v6_4_0.FA_GO_COUNT_OFFSET + PeptideData_v6_4_0.FA_COUNT_SIZE;

    public static readonly FA_POINTER_SIZE = 4;

    public static readonly FA_EC_INDEX_OFFSET = PeptideData_v6_4_0.FA_IPR_COUNT_OFFSET + PeptideData_v6_4_0.FA_COUNT_SIZE;
    public static readonly FA_GO_INDEX_OFFSET = PeptideData_v6_4_0.FA_EC_INDEX_OFFSET + PeptideData_v6_4_0.FA_POINTER_SIZE;
    public static readonly FA_IPR_INDEX_OFFSET = PeptideData_v6_4_0.FA_GO_INDEX_OFFSET + PeptideData_v6_4_0.FA_POINTER_SIZE;

    public static readonly DATA_START = PeptideData_v6_4_0.FA_IPR_INDEX_OFFSET + PeptideData_v6_4_0.FA_POINTER_SIZE;

    public static readonly TAXON_COUNT_SIZE = 4;
    public static readonly TAXON_SIZE = 4;

    public get TAXA_START() {
        let goStart = this.dataView.getUint32(PeptideData_v6_4_0.FA_GO_INDEX_OFFSET);
        const goLength = this.dataView.getUint32(goStart);

        let ecStart = this.dataView.getUint32(PeptideData_v6_4_0.FA_EC_INDEX_OFFSET);
        const ecLength = this.dataView.getUint32(ecStart);

        let iprStart = this.dataView.getUint32(PeptideData_v6_4_0.FA_IPR_INDEX_OFFSET);
        const iprLength = this.dataView.getUint32(iprStart);

        const lineageLength = this.dataView.getUint32(PeptideData_v6_4_0.LINEAGE_COUNT_OFFSET);
        const lineageDataLength = PeptideData_v6_4_0.LINEAGE_COUNT_SIZE + lineageLength * 4;

        const faDataLength = 12 + goLength * 8 + iprLength * 8 + ecLength * 20;
        return PeptideData_v6_4_0.DATA_START + faDataLength + lineageDataLength;
    }

    constructor(
        public readonly dataView: DataView
    ) {}

    public get faCounts(): { all: number, ec: number, go: number, ipr: number } {
        return {
            all: this.dataView.getUint32(PeptideData_v6_4_0.FA_ALL_COUNT_OFFSET),
            ec: this.dataView.getUint32(PeptideData_v6_4_0.FA_EC_COUNT_OFFSET),
            go: this.dataView.getUint32(PeptideData_v6_4_0.FA_GO_COUNT_OFFSET),
            ipr: this.dataView.getUint32(PeptideData_v6_4_0.FA_IPR_COUNT_OFFSET)
        };
    }

    public get lca(): number {
        return this.dataView.getUint32(PeptideData_v6_4_0.LCA_OFFSET);
    }

    public get lineage(): (number | null)[] {
        const length = this.dataView.getUint32(PeptideData_v6_4_0.LINEAGE_COUNT_OFFSET);
        const lineagePointer = this.dataView.getUint32(PeptideData_v6_4_0.LINEAGE_ARRAY_INDEX_OFFSET);

        const lin = [];
        for (let i = 0; i < length; i++) {
            const val = this.dataView.getInt32(lineagePointer + i * 4);
            lin.push(val === 0 ? null : val);
        }
        return lin;
    }

    public get ec(): any {
        const output: any = {};

        let ecStart = this.dataView.getUint32(PeptideData_v6_4_0.FA_EC_INDEX_OFFSET);
        const ecLength = this.dataView.getUint32(ecStart);
        ecStart += 4;

        for (let i = 0; i < ecLength; i++) {
            const part1 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart));
            const part2 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart + 4));
            const part3 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart + 8));
            const part4 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart + 12));
            output[`EC:${part1}.${part2}.${part3}.${part4}`] = this.dataView.getUint32(ecStart + 16);
            ecStart += 20;
        }

        return output;
    }

    private encodedNullOrNumberToString(value: number): string {
        return value === -1 ? "-" : value.toString();
    }

    public get go(): any {
        const output: any = {};

        let goStart = this.dataView.getUint32(PeptideData_v6_4_0.FA_GO_INDEX_OFFSET);
        const goLength = this.dataView.getUint32(goStart);
        goStart += 4;

        for (let i = 0; i < goLength; i++) {
            const term = this.dataView.getUint32(goStart);
            output["GO:" + term.toString().padStart(7, "0")] = this.dataView.getUint32(goStart + 4);
            goStart += 8;
        }

        return output;
    }

    public get ipr(): any {
        const output: any = {};

        let iprStart = this.dataView.getUint32(PeptideData_v6_4_0.FA_IPR_INDEX_OFFSET);
        const iprLength = this.dataView.getUint32(iprStart);
        iprStart += 4;

        for (let i = 0; i < iprLength; i++) {
            const term = this.dataView.getUint32(iprStart);
            output["IPR:IPR" + term.toString().padStart(6, "0")] = this.dataView.getUint32(iprStart + 4);
            iprStart += 8;
        }

        return output;
    }

    public get taxa(): number[] {
        const output = [];
        const taxaLength = this.dataView.getUint32(this.TAXA_START);

        for (let i = 0; i < taxaLength; i++) {
            output.push(this.dataView.getUint32(this.TAXA_START + PeptideData_v6_4_0.TAXON_COUNT_SIZE + i * PeptideData_v6_4_0.TAXON_SIZE));
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
            cutoff_used: false,
            crap_filtered: false
        };
    }
}


export class PeptideDataSerializer_v6_4_0 implements Serializable<PeptideData_v6_4_0> {
    public decode(buffer: Uint8Array): PeptideData_v6_4_0 {
        return new PeptideData_v6_4_0(new DataView(buffer.buffer));
    }

    public encode(object: PeptideData_v6_4_0, destination: Uint8Array): number {
        destination.set(new Uint8Array(
            object.dataView.buffer,
            object.dataView.byteOffset,
            object.dataView.byteLength
        ));
        return object.dataView.byteLength;
    }

    public maximumLength(object: PeptideData_v6_4_0): number {
        return object.dataView.byteLength;
    }
}
