import {computed, ref, Ref} from "vue";
import {defineStore} from "pinia";
import CountTable from "@/logic/processors/CountTable";
import FunctionalAnalysisProcessor from "@/logic/processors/functional/FunctionalAnalysisProcessor";
import useOntologyStore from "@/store/OntologyStore";
import usePeptonizerAnalysisProgress from "@/store/usePeptonizerAnalysisProgress";
import {FunctionalAnalysisStatus} from "@/store/FunctionalAnalysisStatus";
import {GoNamespace} from "@/logic/communicators/unipept/functional/GoResponse";

type GoDomainKey = "biologicalProcess" | "cellularComponent" | "molecularFunction";

interface GoDomainState {
    status: Ref<FunctionalAnalysisStatus>;
    termsToConfidence: Ref<Map<string, number> | undefined>;
    analysisError: Ref<string>;
    currentProgress: Ref<number>;
    etaSeconds: Ref<number>;
    analysisStarted: Ref<boolean>;
    analysisInitializationFinished: Ref<boolean>;
    analysisFinished: Ref<boolean>;
    createListener: ReturnType<typeof usePeptonizerAnalysisProgress>["createListener"];
}

const createGoDomainState = (): GoDomainState => {
    const status = ref<FunctionalAnalysisStatus>(FunctionalAnalysisStatus.Pending);
    const termsToConfidence = ref<Map<string, number> | undefined>();
    const analysisError = ref<string>("");
    const {
        currentProgress,
        etaSeconds,
        started: analysisStarted,
        initializationFinished: analysisInitializationFinished,
        finished: analysisFinished,
        createListener
    } = usePeptonizerAnalysisProgress();

    return {
        status,
        termsToConfidence,
        analysisError,
        currentProgress,
        etaSeconds,
        analysisStarted,
        analysisInitializationFinished,
        analysisFinished,
        createListener
    };
};

const DOMAIN_CONFIG: Record<GoDomainKey, { namespace: GoNamespace; }> = {
    biologicalProcess: {
        namespace: GoNamespace.BiologicalProcess
    },
    cellularComponent: {
        namespace: GoNamespace.CellularComponent
    },
    molecularFunction: {
        namespace: GoNamespace.MolecularFunction
    }
};

const useGOFunctionalAnalysisStore = (sampleId: string) => defineStore(`goFunctionalAnalysisStore_${sampleId}`, () => {
    const ontologyStore = useOntologyStore();

    const biologicalProcess = createGoDomainState();
    const cellularComponent = createGoDomainState();
    const molecularFunction = createGoDomainState();

    const domainStates: Record<GoDomainKey, GoDomainState> = {
        biologicalProcess,
        cellularComponent,
        molecularFunction
    };

    const processors: Partial<Record<GoDomainKey, FunctionalAnalysisProcessor>> = {};

    // Used to stop a GO run (that analyses the domains one after the other) when it is cancelled
    let currentRunId = 0;
    // True during the whole GO run, also between the analyses of two domains
    const runInProgress = ref(false);

    const runDomainAnalysis = async (
        domain: GoDomainKey,
        peptideCountTable: CountTable<string>,
        peptidesFunctions: Map<string, string[]>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        const domainState = domainStates[domain];
        if (domainState.status.value === FunctionalAnalysisStatus.Running) {
            return;
        }

        domainState.status.value = FunctionalAnalysisStatus.Running;
        domainState.termsToConfidence.value = undefined;
        domainState.analysisError.value = "";

        const listener = domainState.createListener();

        try {
            processors[domain] = new FunctionalAnalysisProcessor();
            const {namespace} = DOMAIN_CONFIG[domain];
            const analysisData = await processors[domain]!.runFunctionalAnalysis(
                peptidesFunctions,
                peptideCountTable,
                listener,
                equateIl,
                peptideIntensities,
                {
                    termFilter: term => ontologyStore.getGoDefinition(term)?.namespace === namespace
                }
            );

            if (!analysisData) {
                domainState.status.value = FunctionalAnalysisStatus.Pending;
                return;
            }

            domainState.termsToConfidence.value = analysisData;
            domainState.status.value = FunctionalAnalysisStatus.Finished;
        } catch (error) {
            domainState.status.value = FunctionalAnalysisStatus.Failed;
            console.log(error);
            domainState.analysisError.value = (error as any).toString();
        }
    };

    const runGOFunctionalAnalysis = async (
        peptideCountTable: CountTable<string>,
        peptidesFunctions: Map<string, string[]>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        const runId = ++currentRunId;
        runInProgress.value = true;
        const domains: GoDomainKey[] = ["biologicalProcess", "cellularComponent", "molecularFunction"];
        for (const domain of domains) {
            // Stop if this run has been cancelled
            if (runId !== currentRunId) {
                return;
            }
            await runDomainAnalysis(domain, peptideCountTable, peptidesFunctions, equateIl, peptideIntensities);
        }
        runInProgress.value = false;
    };

    const cancelGOFunctionalAnalysis = () => {
        currentRunId++;
        runInProgress.value = false;
        const domains: GoDomainKey[] = ["biologicalProcess", "cellularComponent", "molecularFunction"];
        for (const domain of domains) {
            processors[domain]?.cancelFunctionalAnalysis();
            domainStates[domain].status.value = FunctionalAnalysisStatus.Pending;
        }
    };

    const status = computed(() => {
        const statuses = [
            biologicalProcess.status.value,
            cellularComponent.status.value,
            molecularFunction.status.value
        ];

        if (runInProgress.value || statuses.some(s => s === FunctionalAnalysisStatus.Running)) {
            return FunctionalAnalysisStatus.Running;
        }
        if (statuses.some(s => s === FunctionalAnalysisStatus.Failed)) {
            return FunctionalAnalysisStatus.Failed;
        }
        if (statuses.every(s => s === FunctionalAnalysisStatus.Finished)) {
            return FunctionalAnalysisStatus.Finished;
        }

        return FunctionalAnalysisStatus.Pending;
    });


    return {
        status,

        biologicalProcessStatus: biologicalProcess.status,
        biologicalProcessTermsToConfidence: biologicalProcess.termsToConfidence,
        biologicalProcessCurrentProgress: biologicalProcess.currentProgress,
        biologicalProcessEtaSeconds: biologicalProcess.etaSeconds,
        biologicalProcessAnalysisStarted: biologicalProcess.analysisStarted,
        biologicalProcessAnalysisInitializationFinished: biologicalProcess.analysisInitializationFinished,
        biologicalProcessAnalysisFinished: biologicalProcess.analysisFinished,
        biologicalProcessAnalysisError: biologicalProcess.analysisError,

        cellularComponentStatus: cellularComponent.status,
        cellularComponentTermsToConfidence: cellularComponent.termsToConfidence,
        cellularComponentCurrentProgress: cellularComponent.currentProgress,
        cellularComponentEtaSeconds: cellularComponent.etaSeconds,
        cellularComponentAnalysisStarted: cellularComponent.analysisStarted,
        cellularComponentAnalysisInitializationFinished: cellularComponent.analysisInitializationFinished,
        cellularComponentAnalysisFinished: cellularComponent.analysisFinished,
        cellularComponentAnalysisError: cellularComponent.analysisError,

        molecularFunctionStatus: molecularFunction.status,
        molecularFunctionTermsToConfidence: molecularFunction.termsToConfidence,
        molecularFunctionCurrentProgress: molecularFunction.currentProgress,
        molecularFunctionEtaSeconds: molecularFunction.etaSeconds,
        molecularFunctionAnalysisStarted: molecularFunction.analysisStarted,
        molecularFunctionAnalysisInitializationFinished: molecularFunction.analysisInitializationFinished,
        molecularFunctionAnalysisFinished: molecularFunction.analysisFinished,
        molecularFunctionAnalysisError: molecularFunction.analysisError,

        runGOFunctionalAnalysis,
        cancelGOFunctionalAnalysis
    }
})();

export type GOFunctionalAnalysisStore = ReturnType<typeof useGOFunctionalAnalysisStore>;

export default useGOFunctionalAnalysisStore;
