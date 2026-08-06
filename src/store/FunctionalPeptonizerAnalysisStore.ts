import {ref, toRaw} from "vue";
import {defineStore} from "pinia";
import CountTable from "@/logic/processors/CountTable";
import FunctionalPeptonizerProcessor from "@/logic/processors/peptonizer/FunctionalPeptonizerProcessor";
import {PeptonizerStatus} from "@/store/PeptonizerAnalysisStore";

// Per-sample, per-category store (one instance per EC/GO-namespace/InterPro run) wrapping
// FunctionalPeptonizerProcessor. `storeId` must be unique per sample *and* per category.
const useFunctionalPeptonizerStore = (storeId: string) => defineStore(`functionalPeptonizerStore_${storeId}`, () => {
    const status = ref<PeptonizerStatus>(PeptonizerStatus.Pending);
    const termsToConfidence = ref<Map<string, number> | undefined>();
    const peptonizerError = ref<string>("");

    let processor: FunctionalPeptonizerProcessor | undefined;

    const runFunctionalPeptonizer = async (
        peptideTerms: Map<string, string[]>,
        peptideCountTable: CountTable<string>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        // A previous run for this category (if any) is stale as soon as a new one is requested; cancel it so
        // it releases the app-wide FunctionalPeptonizerProcessor lock instead of piling up behind it.
        if (processor) {
            processor.cancelPeptonizer();
        }

        status.value = PeptonizerStatus.Running;
        peptonizerError.value = "";

        try {
            processor = new FunctionalPeptonizerProcessor();
            const result = await processor.run(peptideTerms, peptideCountTable, equateIl, peptideIntensities);

            // No data is returned by the peptonizer if its execution has been cancelled.
            if (!result) {
                status.value = PeptonizerStatus.Pending;
                return;
            }

            termsToConfidence.value = result;
            status.value = PeptonizerStatus.Finished;
        } catch (error) {
            status.value = PeptonizerStatus.Failed;
            peptonizerError.value = (error as any).toString();
        }
    }

    const exportStore = (): FunctionalPeptonizerStoreImport | undefined => {
        if (termsToConfidence.value) {
            return {
                termsToConfidence: Array.from(toRaw(termsToConfidence.value).entries()),
                status: status.value
            }
        }

        return undefined;
    }

    const setImportedData = (storeImport: FunctionalPeptonizerStoreImport) => {
        termsToConfidence.value = new Map<string, number>(storeImport.termsToConfidence);
        status.value = PeptonizerStatus.Finished;
    }

    return {
        termsToConfidence,

        status,
        peptonizerError,

        runFunctionalPeptonizer,
        exportStore,
        setImportedData
    }
})();

export type FunctionalPeptonizerStoreImport = {
    termsToConfidence: [string, number][];
    status: PeptonizerStatus;
}

export type FunctionalPeptonizerStore = ReturnType<typeof useFunctionalPeptonizerStore>;

export default useFunctionalPeptonizerStore;
