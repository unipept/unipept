import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import JSZip from "jszip";
import {
    From640To651Upgrader,
    PeptideData_v6_4_0,
    PeptideDataSerializer_v6_4_0
} from "@/logic/project/upgraders/From640To651Upgrader";
import { SemVer } from "@/logic/project/SemVer";
import { ShareableMap, type TransferableState } from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptideDataResponse from "@/logic/ontology/peptides/PeptideDataResponse";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import { ArrayBufferUtils } from "@/logic/utils/ArrayBufferUtils";

function createMetadata(version: string, analysisIds: string[] = ["a1"]): any {
    return {
        version,
        groups: [
            {
                analyses: analysisIds.map((id) => ({ id, config: {
                    equate: false,
                    filter: false,
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

/**
 * Builds a ShareableMap using the v6.4.0 binary format and writes its buffers
 * into the given zip's buffers/ folder under `analysisId`.
 */
async function writeV640Map(
    zip: JSZip,
    analysisId: string,
    entries: Record<string, PeptideDataResponse>
): Promise<void> {
    const serializer = new PeptideDataSerializer_v6_4_0();
    const map = new ShareableMap<string, PeptideData_v6_4_0>({ serializer });

    for (const [peptide, response] of Object.entries(entries)) {
        // Build a v6.4.0 object by constructing the binary buffer manually.
        // We reuse the current PeptideData (v6.5.1) factory and then strip the
        // cutoff byte by reading everything except that 1 byte.  A simpler
        // approach: just create the v6.4.0 object directly from the response
        // using the same encoding logic that was present in v6.4.0.
        const newObj = PeptideData.createFromPeptideDataResponse(response);
        const oldBuf = stripCutoffByte(newObj.dataView);
        map.set(peptide, new PeptideData_v6_4_0(oldBuf));
    }

    const transferable = map.toTransferableState();
    const indexArray = new Uint8Array(transferable.indexBuffer as SharedArrayBuffer);
    const dataArray = new Uint8Array(transferable.dataBuffer as SharedArrayBuffer);

    const buffersFolder = zip.folder("buffers")!;
    buffersFolder.file(`${analysisId}.index`, indexArray.slice().buffer, { binary: true });
    buffersFolder.file(`${analysisId}.data`, dataArray.slice().buffer, { binary: true });
}

/**
 * Produces a DataView that matches the v6.4.0 layout by removing the 1-byte
 * cutoff_used slot (byte 40) from a v6.5.1 buffer.
 *
 * v6.5.1 layout: [...header up to byte 39][cutoff byte 40][variable data from 41]
 * v6.4.0 layout: [...header up to byte 39][variable data from 40]
 *
 * All internal pointers in the variable section must be decremented by 1.
 */
function stripCutoffByte(view: DataView): DataView {
    const src = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    const dst = new Uint8Array(src.length - 1);

    // Copy fixed header (bytes 0–39) unchanged.
    dst.set(src.subarray(0, 40), 0);
    // Skip byte 40 (cutoff_used), copy variable data from byte 41 onwards.
    dst.set(src.subarray(41), 40);

    // Adjust the four pointer fields that reference positions in the variable
    // data section; each stored value was written relative to DATA_START=41
    // and now needs to be relative to DATA_START=40.
    const dstView = new DataView(dst.buffer);

    const LINEAGE_ARRAY_INDEX_OFFSET = 8;
    const FA_EC_INDEX_OFFSET = 28;
    const FA_GO_INDEX_OFFSET = 32;
    const FA_IPR_INDEX_OFFSET = 36;

    for (const offset of [LINEAGE_ARRAY_INDEX_OFFSET, FA_EC_INDEX_OFFSET, FA_GO_INDEX_OFFSET, FA_IPR_INDEX_OFFSET]) {
        dstView.setUint32(offset, dstView.getUint32(offset) - 1);
    }

    return dstView;
}

describe("From640To651Upgrader.canUpgrade", () => {
    it("throws when metadata.json is missing", async () => {
        const zip = new JSZip();
        const upgrader = new From640To651Upgrader();

        await expect(upgrader.canUpgrade(zip)).rejects.toThrow(
            "Failed to find metadata.json while determining upgrade eligibility."
        );
    });

    it("throws when version is missing from metadata", async () => {
        const zip = await createZipWithMetadata({});
        const upgrader = new From640To651Upgrader();

        await expect(upgrader.canUpgrade(zip)).rejects.toThrow(
            "Project version is missing in metadata.json. Unable to determine upgrade eligibility."
        );
    });

    it("returns true for version equal to 6.5.0", async () => {
        const spyCompare = vi.spyOn(SemVer, "compare");
        const zip = await createZipWithMetadata({ version: "6.5.0" });
        const upgrader = new From640To651Upgrader();

        await expect(upgrader.canUpgrade(zip)).resolves.toBe(true);
        expect(spyCompare).toHaveBeenCalledWith("6.5.0", "6.5.0");
    });

    it("returns true for version older than 6.5.0", async () => {
        const zip = await createZipWithMetadata({ version: "6.4.0" });
        const upgrader = new From640To651Upgrader();

        await expect(upgrader.canUpgrade(zip)).resolves.toBe(true);
    });

    it("returns false for version newer than 6.5.0", async () => {
        const zip = await createZipWithMetadata({ version: "6.5.1" });
        const upgrader = new From640To651Upgrader();

        await expect(upgrader.canUpgrade(zip)).resolves.toBe(false);
    });
});

describe("From640To651Upgrader.upgrade", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("throws when metadata.json is missing during upgrade", async () => {
        const zip = new JSZip();
        zip.folder("buffers");

        const upgrader = new From640To651Upgrader();

        await expect(upgrader.upgrade(zip)).rejects.toThrow(
            "Failed to find metadata.json while upgrading project from 6.4.0 to 6.5.1."
        );
    });

    it("throws when peptide data buffers for an analysis are missing", async () => {
        const metadata = createMetadata("6.5.0", ["missing"]);
        const zip = await createZipWithMetadata(metadata);
        zip.folder("buffers");

        const upgrader = new From640To651Upgrader();

        await expect(upgrader.upgrade(zip)).rejects.toThrow(
            "Failed to find peptide data buffers for analysis 'missing' while upgrading project from 6.4.0 to 6.5.1."
        );
    });

    it("upgrades buffers, sets cutoff_used based on fa.counts.all, and bumps version to 6.5.1", async () => {
        const metadata = createMetadata("6.5.0", ["a1"]);
        const zip = await createZipWithMetadata(metadata);
        zip.folder("buffers");

        const responses: Record<string, PeptideDataResponse> = {
            // all > 9000 → cutoff_used should be true after upgrade
            PEPTIDE_OVER: {
                lca: 1,
                lineage: [1, 2, 3],
                fa: {
                    counts: { all: 10000, EC: 2, GO: 1, IPR: 1 },
                    data: { "EC:1.2.3.4": 2, "GO:0000001": 10, "IPR:IPR000001": 5 }
                },
                taxa: [10, 20],
                cutoff_used: false
            },
            // all <= 9000 → cutoff_used should be false after upgrade
            PEPTIDE_UNDER: {
                lca: 2,
                lineage: [4, 5, 6],
                fa: {
                    counts: { all: 5000, EC: 1, GO: 0, IPR: 0 },
                    data: { "EC:9.9.9.9": 1 }
                },
                taxa: [30],
                cutoff_used: false
            }
        };

        await writeV640Map(zip, "a1", responses);

        const upgrader = new From640To651Upgrader();
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        const upgraded = await upgrader.upgrade(zip);

        const updatedMetadata = JSON.parse(await upgraded.file("metadata.json")!.async("string"));
        expect(updatedMetadata.version).toBe("6.5.1");

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

        expect(Array.from(mapV2.keys()).sort()).toEqual(Object.keys(responses).sort());

        const over = mapV2.get("PEPTIDE_OVER")!;
        expect(over.cutoffUsed).toBe(true);
        expect(over.lca).toBe(responses["PEPTIDE_OVER"].lca);
        expect(over.faCounts.all).toBe(10000);

        const under = mapV2.get("PEPTIDE_UNDER")!;
        expect(under.cutoffUsed).toBe(false);
        expect(under.lca).toBe(responses["PEPTIDE_UNDER"].lca);
        expect(under.faCounts.all).toBe(5000);

        consoleSpy.mockRestore();
    });
});
