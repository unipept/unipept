import { ShareableMap } from "shared-memory-datastructures";
import type { PathwayProcessorData, PathwayProcessorOutput } from "../pathway/usePathwayProcessor";

self.onunhandledrejection = (event) => {
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(process(event.data));
};

const process = ({
    peptideCountsTransferable,
    ecToPeptides,
    ecMapping,
    pathwayMapping
}: PathwayProcessorData): PathwayProcessorOutput => {
    const peptideCounts = ShareableMap.fromTransferableState<string, number>(peptideCountsTransferable);

    // Step 1: build EC set and per-EC spectral counts (strip "EC:" prefix)
    const ecs = new Set<string>();
    const ecToPeptideCount = new Map<string, number>();

    for (const [rawEc, peptideList] of ecToPeptides.entries()) {
        const ecId = rawEc.startsWith("EC:") ? rawEc.substring(3) : rawEc;
        ecs.add(ecId);
        let count = 0;
        for (const peptide of peptideList) {
            count += peptideCounts.get(peptide) ?? 0;
        }
        ecToPeptideCount.set(ecId, count);
    }

    // Step 2: use ecMapping to build EC→pathways and pathway peptide counts
    const ecToPathways = new Map<string, Set<string>>();
    const pathwayToPeptideCounts = new Map<string, number>();
    const pathways = new Set<string>();

    for (const ecId of ecs) {
        const ecInfo = ecMapping.get(ecId);
        if (!ecInfo?.pathways?.length) continue;

        const ecCount = ecToPeptideCount.get(ecId) ?? 0;

        if (!ecToPathways.has(ecId)) {
            ecToPathways.set(ecId, new Set());
        }

        for (const pathwayEntry of ecInfo.pathways) {
            const pathwayId = pathwayEntry.id;
            ecToPathways.get(ecId)!.add(pathwayId);
            pathways.add(pathwayId);
            pathwayToPeptideCounts.set(
                pathwayId,
                (pathwayToPeptideCounts.get(pathwayId) ?? 0) + ecCount
            );
        }
    }

    // Step 3: use pathwayMapping to build compound→pathway mapping
    const compounds = new Set<string>();
    const compoundToPathways = new Map<string, Set<string>>();

    for (const pathwayId of pathways) {
        const pathwayInfo = pathwayMapping.get(pathwayId);
        if (!pathwayInfo?.compoundIds?.length) continue;

        for (const compoundId of pathwayInfo.compoundIds) {
            compounds.add(compoundId);
            if (!compoundToPathways.has(compoundId)) {
                compoundToPathways.set(compoundId, new Set());
            }
            compoundToPathways.get(compoundId)!.add(pathwayId);
        }
    }

    return {
        ecs,
        compounds,
        pathways,
        ecToPeptideCount,
        pathwayToPeptideCounts,
        ecToPathways,
        compoundToPathways
    };
};
