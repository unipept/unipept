import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import JSZip from "jszip";
import {
    From634To635Upgrader,
    PeptideData_v6_3_4,
    PeptideDataSerializer_v6_3_4
} from "@/logic/project/upgraders/From634To635Upgrader";
import { SemVer } from "@/logic/project/SemVer";
import { ShareableMap, type TransferableState } from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptideDataResponse from "@/logic/ontology/peptides/PeptideDataResponse";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import { ArrayBufferUtils } from "@/logic/utils/ArrayBufferUtils";

// Helper to create basic metadata for a single analysis
function createMetadata(version: string, analysisIds: string[] = ["a1"]): any {
    return {
        version,
        groups: [
            {
                analyses: analysisIds.map((id) => ({ id, config: {
                    equate: false,
                    filter: false,
                    missed: true,
                    database: "Test"
                }}))
            }
        ]
    };
}

async function createZipWithMetadata(metadata: unknown): Promise<JSZip> {
    const zip = new JSZip();
    zip.file("metadata.json", JSON.stringify(metadata));
    return zip;
}

describe("From634To635Upgrader.canUpgrade", () => {
    it("throws when metadata.json is missing", async () => {
        const zip = new JSZip();
        const upgrader = new From634To635Upgrader();

        await expect(upgrader.canUpgrade(zip)).rejects.toThrow(
            "Failed to find metadata.json while determining upgrade eligibility."
        );
    });

    it("throws when version is missing from metadata", async () => {
        const zip = await createZipWithMetadata({});
        const upgrader = new From634To635Upgrader();

        await expect(upgrader.canUpgrade(zip)).rejects.toThrow(
            "Project version is missing in metadata.json. Unable to determine upgrade eligibility."
        );
    });

    it("returns true when project version is older than or equal to 6.3.4", async () => {
        const spyCompare = vi.spyOn(SemVer, "compare");
        const zip = await createZipWithMetadata({ version: "6.3.4" });
        const upgrader = new From634To635Upgrader();

        await expect(upgrader.canUpgrade(zip)).resolves.toBe(true);
        expect(spyCompare).toHaveBeenCalledWith("6.3.4", "6.3.4");
    });

    it("returns false when project version is newer than 6.3.4", async () => {
        const zip = await createZipWithMetadata({ version: "6.3.5" });
        const upgrader = new From634To635Upgrader();

        await expect(upgrader.canUpgrade(zip)).resolves.toBe(false);
    });
});

describe("From634To635Upgrader.upgrade", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("throws when buffers folder is missing", async () => {
        const metadata = createMetadata("6.3.4", ["a1"]);
        const zip = await createZipWithMetadata(metadata);
        // Note: no buffers folder is created, so the upgrader should fail
        // immediately when trying to locate it.

        const upgrader = new From634To635Upgrader();

        await expect(upgrader.upgrade(zip)).rejects.toThrow(
            "Failed to find peptide data buffers for analysis 'a1' while upgrading project from 6.3.4 to 6.3.5."
        );
    });

    it("throws when metadata.json is missing during upgrade", async () => {
        const zip = new JSZip();
        zip.folder("buffers");

        const upgrader = new From634To635Upgrader();

        await expect(upgrader.upgrade(zip)).rejects.toThrow(
            "Failed to find metadata.json while upgrading project from 6.3.4 to 6.3.5."
        );
    });

    it("throws when peptide data buffers for an analysis are missing", async () => {
        const metadata = createMetadata("6.3.4", ["missing"]);
        const zip = await createZipWithMetadata(metadata);
        zip.folder("buffers");

        const upgrader = new From634To635Upgrader();

        await expect(upgrader.upgrade(zip)).rejects.toThrow(
            "Failed to find peptide data buffers for analysis 'missing' while upgrading project from 6.3.4 to 6.3.5."
        );
    });

    it("upgrades peptide data buffers from V1 to V2, updates project version and analysis configs", async () => {
        const metadata = createMetadata("6.3.4", ["a1"]);
        const zip = await createZipWithMetadata(metadata);
        const buffersFolder = zip.folder("buffers")!;

        // Construct a tiny ShareableMap<string, PeptideDataV1>
        const responses: Record<string, PeptideDataResponse> = {
            PEPTIDE1: {
                lca: 1,
                lineage: [1, 2, 3],
                fa: {
                    counts: { all: 10, EC: 5, GO: 3, IPR: 2 },
                    data: { "EC:1.2.3.5": 2, "GO:0000001": 35, "IPR:IPR000121": 18 }
                },
                taxa: [17, 45, 23]
            },
            PEPTIDE2: {
                lca: 2,
                lineage: [4, 5, 6],
                fa: {
                    counts: { all: 4, EC: 2, GO: 1, IPR: 1 },
                    data: { "EC:9.9.9.9": 1 }
                },
                taxa: [59, 47, 78]
            }
        };

        const serializerV1 = new PeptideDataSerializer_v6_3_4();
        const mapV1 = new ShareableMap<string, PeptideData_v6_3_4>({ serializer: serializerV1 });

        for (const [pep, resp] of Object.entries(responses)) {
            mapV1.set(pep, PeptideData_v6_3_4.createFromPeptideDataResponse(resp));
        }

        const transferable = mapV1.toTransferableState();

        // Convert SharedArrayBuffers to regular ArrayBuffers for storage
        const indexArray = new Uint8Array(transferable.indexBuffer as SharedArrayBuffer);
        const dataArray = new Uint8Array(transferable.dataBuffer as SharedArrayBuffer);

        buffersFolder.file("a1.index", indexArray.slice().buffer, { binary: true });
        buffersFolder.file("a1.data", dataArray.slice().buffer, { binary: true });

        const upgrader = new From634To635Upgrader();

        // Silence console.log noise from upgrader
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        const upgraded = await upgrader.upgrade(zip);

        // Metadata version should be updated to 6.3.5
        const updatedMetadata = JSON.parse(await upgraded.file("metadata.json")!.async("string"));
        expect(updatedMetadata.version).toBe("6.3.5");

        // Analysis config should be the same and useCrap should be set to false
        const updatedAnalysisConfig = updatedMetadata.groups[0].analyses[0].config;
        expect(updatedAnalysisConfig.equate).toBe(false);
        expect(updatedAnalysisConfig.filter).toBe(false);
        expect(updatedAnalysisConfig.missed).toBe(true);
        expect(updatedAnalysisConfig.database).toBe("Test");
        expect(updatedAnalysisConfig.useCrap).toBe(false);

        // Reconstruct the new map from upgraded buffers as V2 to validate data
        const upgradedBuffersFolder = upgraded.folder("buffers")!;
        const newIndexArrayBuffer = await upgradedBuffersFolder.file("a1.index")!.async("arraybuffer");
        const newDataArrayBuffer = await upgradedBuffersFolder.file("a1.data")!.async("arraybuffer");

        const newIndexShared = ArrayBufferUtils.arrayBufferToShared(newIndexArrayBuffer);
        const newDataShared = ArrayBufferUtils.arrayBufferToShared(newDataArrayBuffer);

        const newTransferable: TransferableState = {
            indexBuffer: newIndexShared,
            dataBuffer: newDataShared
        };

        const mapV2 = ShareableMap.fromTransferableState<string, PeptideData>(
            newTransferable,
            { serializer: new PeptideDataSerializer() }
        );

        // The keys should be preserved
        expect(Array.from(mapV2.keys()).sort()).toEqual(Object.keys(responses).sort());

        // Each peptide data should round‑trip to the original response structure
        for (const [pep, v2] of mapV2) {
            const original = responses[pep];
            const roundTripped = v2.toPeptideDataResponse();
            expect(roundTripped.lca).toBe(original.lca);
            // PeptideData always has a fixed-length lineage, so the original
            // lineage must match the prefix of the upgraded lineage.
            expect(roundTripped.lineage.slice(0, original.lineage.length)).toEqual(original.lineage);
            expect(roundTripped.fa.counts).toEqual(original.fa.counts);
            expect(roundTripped.fa.data).toEqual(original.fa.data);
            expect(roundTripped.taxa).toEqual(original.taxa);
        }

        consoleSpy.mockRestore();
    });
});
