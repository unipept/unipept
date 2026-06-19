import {ref, toRaw} from "vue";
import {defineStore} from "pinia";
import CountTable from "@/logic/processors/CountTable";
import FunctionalAnalysisProcessor from "@/logic/processors/functional/FunctionalAnalysisProcessor";
import useOntologyStore from "@/store/OntologyStore";
import usePeptonizerAnalysisProgress from "@/store/usePeptonizerAnalysisProgress";
import {FunctionalAnalysisStatus} from "@/store/FunctionalAnalysisStatus";

const useInterproFunctionalAnalysisStore = (sampleId: string) => defineStore(`interproFunctionalAnalysisStore_${sampleId}`, () => {
    const status = ref<FunctionalAnalysisStatus>(FunctionalAnalysisStatus.Pending);
    const iprTermsToConfidence = ref<Map<string, number> | undefined>();

    const {
        currentProgress,
        etaSeconds,
        started: analysisStarted,
        initializationFinished: analysisInitializationFinished,
        finished: analysisFinished,
        createListener
    } = usePeptonizerAnalysisProgress();
    const analysisError = ref<string>("");

    let processor: FunctionalAnalysisProcessor | undefined;

    const runInterproFunctionalAnalysis = async (
        peptideCountTable: CountTable<string>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        if (status.value === FunctionalAnalysisStatus.Running) return;
        status.value = FunctionalAnalysisStatus.Running;

        iprTermsToConfidence.value = undefined;
        analysisError.value = "";

        const listener = createListener();

        try {
            processor = new FunctionalAnalysisProcessor();
            const analysisData = await processor.runFunctionalAnalysisFromPeptideProteinPairs(
                "ipr",
                peptideCountTable,
                listener,
                equateIl,
                peptideIntensities,
                { analysisLabel: "InterPro Functional Analysis" }
            );

            if (!analysisData) {
                status.value = FunctionalAnalysisStatus.Pending;
                return;
            }

            iprTermsToConfidence.value = analysisData;

            const {updateIprOntology} = useOntologyStore();
            await updateIprOntology(Array.from(iprTermsToConfidence.value.keys()));

            status.value = FunctionalAnalysisStatus.Finished;
        } catch (error) {
            status.value = FunctionalAnalysisStatus.Failed;
            console.log(error);
            analysisError.value = (error as any).toString();
        }
    }

    const cancelInterproFunctionalAnalysis = () => {
        if (processor) {
            processor.cancelFunctionalAnalysis();
        }
        status.value = FunctionalAnalysisStatus.Pending;
    }

    const exportStore = (): InterproFunctionalAnalysisStoreImport | undefined => {
        if (iprTermsToConfidence.value) {
            return {
                iprTermsToConfidence: Array.from(toRaw(iprTermsToConfidence.value).entries()),
                status: status.value
            };
        }

        return undefined;
    }

    const setImportedData = (storeImport: InterproFunctionalAnalysisStoreImport) => {
        iprTermsToConfidence.value = new Map<string, number>(storeImport.iprTermsToConfidence);
        status.value = FunctionalAnalysisStatus.Finished;
    }

    return {
        iprTermsToConfidence,

        status,
        currentProgress,
        etaSeconds,
        analysisStarted,
        analysisInitializationFinished,
        analysisFinished,
        analysisError,

        runInterproFunctionalAnalysis,
        cancelInterproFunctionalAnalysis,
        exportStore,
        setImportedData
    }
})();

export type InterproFunctionalAnalysisStoreImport = {
    iprTermsToConfidence: [string, number][];
    status: FunctionalAnalysisStatus;
}

export type InterproFunctionalAnalysisStore = ReturnType<typeof useInterproFunctionalAnalysisStore>;

export default useInterproFunctionalAnalysisStore;
