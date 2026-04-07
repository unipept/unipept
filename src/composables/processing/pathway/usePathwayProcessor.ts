import { markRaw, shallowRef, toRaw } from "vue";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import PathwayProcessorWebWorker from "../workers/pathwayProcessor.worker.ts?worker";
import { TransferableState } from "shared-memory-datastructures";
import CountTable from "@/logic/processors/CountTable";
import type { EcInfo, PathwayInfo } from "@/logic/communicators/PathwayPilotCommunicator";

export interface PathwayProcessorData {
    peptideCountsTransferable: TransferableState;
    ecToPeptides: Map<string, string[]>;
    ecMapping: Map<string, EcInfo>;
    pathwayMapping: Map<string, PathwayInfo>;
}

export interface PathwayProcessorOutput {
    ecs: Set<string>;
    compounds: Set<string>;
    pathways: Set<string>;
    ecToPeptideCount: Map<string, number>;
    pathwayToPeptideCounts: Map<string, number>;
    ecToPathways: Map<string, Set<string>>;
    compoundToPathways: Map<string, Set<string>>;
}

export default function usePathwayProcessor() {
    const ecs = shallowRef<Set<string>>(new Set());
    const compounds = shallowRef<Set<string>>(new Set());
    const pathways = shallowRef<Set<string>>(new Set());
    const ecToPeptideCount = shallowRef<Map<string, number>>(new Map());
    const pathwayToPeptideCounts = shallowRef<Map<string, number>>(new Map());
    const ecToPathways = shallowRef<Map<string, Set<string>>>(new Map());
    const compoundToPathways = shallowRef<Map<string, Set<string>>>(new Map());

    const { post } = useAsyncWebWorker<PathwayProcessorData, PathwayProcessorOutput>(
        () => new PathwayProcessorWebWorker()
    );

    const process = async (
        ecToPeptidesInput: Map<string, string[]>,
        peptidesTable: CountTable<string>,
        ecMappingInput: Map<string, EcInfo>,
        pathwayMappingInput: Map<string, PathwayInfo>
    ) => {
        const output = await post({
            peptideCountsTransferable: peptidesTable.counts.toTransferableState(),
            ecToPeptides: toRaw(ecToPeptidesInput),
            ecMapping: toRaw(ecMappingInput),
            pathwayMapping: toRaw(pathwayMappingInput)
        });

        ecs.value = markRaw(output.ecs);
        compounds.value = markRaw(output.compounds);
        pathways.value = markRaw(output.pathways);
        ecToPeptideCount.value = markRaw(output.ecToPeptideCount);
        pathwayToPeptideCounts.value = markRaw(output.pathwayToPeptideCounts);
        ecToPathways.value = markRaw(output.ecToPathways);
        compoundToPathways.value = markRaw(output.compoundToPathways);
    };

    return {
        ecs,
        compounds,
        pathways,
        ecToPeptideCount,
        pathwayToPeptideCounts,
        ecToPathways,
        compoundToPathways,

        process
    };
}
