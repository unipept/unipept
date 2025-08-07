import {ShareableMap, TransferableState} from "shared-memory-datastructures";
import {markRaw, ref, shallowRef, toRaw} from "vue";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import {Filter} from "@/store/CustomFilterStore";
import Pept2filteredWebWorker from "./pept2filtered.worker.ts?worker&inline";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";

export interface Pept2filteredData {
    peptides: string[],
    equate: boolean,
    filter: Filter | undefined,
    baseUrl: string,
    batchSize: number,
    parallelRequests: number
}

export interface Pept2filteredWorkerOutput {
    peptToDataTransferable: TransferableState;
}

export default function usePept2filtered(
    baseUrl = DEFAULT_API_BASE_URL,
    batchSize = 500,
    parallelRequests = 5,
) {
    const peptideData = shallowRef<ShareableMap<string, PeptideData>>();

    const { post } = useAsyncWebWorker<Pept2filteredData, Pept2filteredWorkerOutput>(
        () => new Pept2filteredWebWorker()
    );

    const process = async (
        peptides: string[],
        equate: boolean,
        filter: Filter | undefined
    ) => {
        const { peptToDataTransferable } = await post({
            peptides,
            equate,
            filter: toRaw(filter),
            baseUrl,
            batchSize,
            parallelRequests
        });

        peptideData.value = markRaw(ShareableMap.fromTransferableState<string, PeptideData>(peptToDataTransferable, { serializer: new PeptideDataSerializer() }));
    }

    return {
        peptideData,

        process
    }
}
