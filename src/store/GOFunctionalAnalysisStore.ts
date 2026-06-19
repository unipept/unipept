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

const DOMAIN_CONFIG: Record<GoDomainKey, { namespace: GoNamespace; label: string; }> = {
    biologicalProcess: {
        namespace: GoNamespace.BiologicalProcess,
        label: "GO Biological Process Functional Analysis"
    },
    cellularComponent: {
        namespace: GoNamespace.CellularComponent,
        label: "GO Cellular Component Functional Analysis"
    },
    molecularFunction: {
        namespace: GoNamespace.MolecularFunction,
        label: "GO Molecular Function Functional Analysis"
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

    const runGOFunctionalAnalysis = async (
        peptideCountTable: CountTable<string>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        const domains: GoDomainKey[] = ["biologicalProcess", "cellularComponent", "molecularFunction"];

        if (domains.some(domain => domainStates[domain].status.value === FunctionalAnalysisStatus.Running)) {
            return;
        }

        for (const domain of domains) {
            domainStates[domain].status.value = FunctionalAnalysisStatus.Running;
            domainStates[domain].termsToConfidence.value = undefined;
            domainStates[domain].analysisError.value = "";
        }

        const listener = biologicalProcess.createListener();

        try {
            processors.biologicalProcess = new FunctionalAnalysisProcessor();
            const allGoTermConfidence = await processors.biologicalProcess.runFunctionalAnalysisFromPeptideProteinPairs(
                "go",
                peptideCountTable,
                listener,
                equateIl,
                peptideIntensities,
                { analysisLabel: "GO Functional Analysis" }
            );

            if (!allGoTermConfidence) {
                for (const domain of domains) {
                    domainStates[domain].status.value = FunctionalAnalysisStatus.Pending;
                }
                return;
            }

            const allTerms = Array.from(allGoTermConfidence.keys());
            if (allTerms.length > 0) {
                await ontologyStore.updateGoOntology(allTerms);
            }

            const byDomain: Record<GoDomainKey, Map<string, number>> = {
                biologicalProcess: new Map<string, number>(),
                cellularComponent: new Map<string, number>(),
                molecularFunction: new Map<string, number>()
            };

            for (const [term, confidence] of allGoTermConfidence.entries()) {
                const namespace = ontologyStore.getGoDefinition(term)?.namespace;
                if (namespace === DOMAIN_CONFIG.biologicalProcess.namespace) {
                    byDomain.biologicalProcess.set(term, confidence);
                } else if (namespace === DOMAIN_CONFIG.cellularComponent.namespace) {
                    byDomain.cellularComponent.set(term, confidence);
                } else if (namespace === DOMAIN_CONFIG.molecularFunction.namespace) {
                    byDomain.molecularFunction.set(term, confidence);
                }
            }

            for (const domain of domains) {
                domainStates[domain].termsToConfidence.value = byDomain[domain];
                domainStates[domain].status.value = FunctionalAnalysisStatus.Finished;
            }
        } catch (error) {
            const errorMessage = (error as any).toString();
            for (const domain of domains) {
                domainStates[domain].status.value = FunctionalAnalysisStatus.Failed;
                domainStates[domain].analysisError.value = errorMessage;
            }
            console.log(error);
        }
    };

    const cancelGOFunctionalAnalysis = () => {
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

        if (statuses.some(s => s === FunctionalAnalysisStatus.Running)) {
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

    const exportStore = (): GOFunctionalAnalysisStoreImport | undefined => {
        if (
            biologicalProcess.termsToConfidence.value ||
            cellularComponent.termsToConfidence.value ||
            molecularFunction.termsToConfidence.value
        ) {
            return {
                biologicalProcessTermsToConfidence: Array.from((biologicalProcess.termsToConfidence.value || new Map()).entries()),
                cellularComponentTermsToConfidence: Array.from((cellularComponent.termsToConfidence.value || new Map()).entries()),
                molecularFunctionTermsToConfidence: Array.from((molecularFunction.termsToConfidence.value || new Map()).entries())
            };
        }

        return undefined;
    };

    const setImportedData = (storeImport: GOFunctionalAnalysisStoreImport) => {
        biologicalProcess.termsToConfidence.value = new Map<string, number>(storeImport.biologicalProcessTermsToConfidence || []);
        cellularComponent.termsToConfidence.value = new Map<string, number>(storeImport.cellularComponentTermsToConfidence || []);
        molecularFunction.termsToConfidence.value = new Map<string, number>(storeImport.molecularFunctionTermsToConfidence || []);

        biologicalProcess.status.value = FunctionalAnalysisStatus.Finished;
        cellularComponent.status.value = FunctionalAnalysisStatus.Finished;
        molecularFunction.status.value = FunctionalAnalysisStatus.Finished;
    };

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
        cancelGOFunctionalAnalysis,
        exportStore,
        setImportedData
    }
})();

export type GOFunctionalAnalysisStoreImport = {
    biologicalProcessTermsToConfidence: [string, number][];
    cellularComponentTermsToConfidence: [string, number][];
    molecularFunctionTermsToConfidence: [string, number][];
}

export type GOFunctionalAnalysisStore = ReturnType<typeof useGOFunctionalAnalysisStore>;

export default useGOFunctionalAnalysisStore;
