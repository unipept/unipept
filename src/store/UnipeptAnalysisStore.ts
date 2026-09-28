import {defineStore} from "pinia";
import useProjectAnalysisStore from "@/store/ProjectAnalysisStore";
import localforage from "localforage";
import {SampleData} from "@/composables/communication/unipept/useSampleData";
import {ReprocessedFile} from "@/composables/communication/reprocessed/useReprocessedProjects";
import {AnalysisConfig} from "@/store/AnalysisConfig";
import useCustomFilterStore, {UNIPROT_ID} from "@/store/CustomFilterStore";
import useProjectExport from "@/composables/useProjectExport";
import useProjectImport from "@/composables/useProjectImport";
import useAppStateStore from "@/store/AppStateStore";
import {watchDebounced} from "@vueuse/core";
import AnalyticsCommunicator from "@/logic/communicators/analytics/AnalyticsCommunicator";

interface StoreValue {
    lastAccessed: number;
    totalPeptides: number;
    project: Blob;
    upgradeError?: string | null;
}

// Default analysis configuration shared by the preset (demo / reprocessed) project loaders.
const DEMO_ANALYSIS_CONFIG: AnalysisConfig = {
    equate: true,
    filter: true,
    useCrap: false,
    database: UNIPROT_ID
};

const useUnipeptAnalysisStore = defineStore('PersistedAnalysisStore', () => {
    const store = localforage.createInstance({
        driver: localforage.INDEXEDDB,
        storeName: 'projects',
        name: 'unipept',
    });

    const { process: storeToBlob } = useProjectExport();
    const { process: blobToStore, status: importStatus } = useProjectImport();

    const project = useProjectAnalysisStore();
    const customDatabases = useCustomFilterStore();
    const appState = useAppStateStore();

    const getProjects = async () => {
        const keys = await store.keys();
        return await Promise.all(keys.map(async (key) => {
            const value: StoreValue | null = await store.getItem(key);
            return {
                name: key,
                totalPeptides: value?.totalPeptides || 0,
                lastAccessed: new Date(value!.lastAccessed),
                upgradeError: value?.upgradeError || null
            };
        }));
    }

    const loadNewProject = async (projectName: string) => {
        appState.clear();
        project.clear();
        project.setName(projectName);
        project.setDemoMode(false);
        
        // Track project creation
        const analyticsCommunicator = new AnalyticsCommunicator();
        analyticsCommunicator.logCreateNewProject();
    }

    const loadProjectFromStorage = async (projectName: string) => {
        const value: StoreValue | null = await store.getItem(projectName);
        if (value !== null) {
            const processedImport = await blobToStore(value.project).catch(async (e: unknown) => {
                const message = e instanceof Error ? e.message : String(e);
                await store.setItem(projectName, { ...value, upgradeError: message });
                throw e;
            });

            if (value.upgradeError) {
                await store.setItem(projectName, { ...value, upgradeError: null });
            }

            appState.clear();
            project.clear();
            project.setImportedData(processedImport.project);
            project.setName(projectName);
            project.setDemoMode(false);
            appState.setImportedData(processedImport.appState, project);

            // Track project loading
            const analyticsCommunicator = new AnalyticsCommunicator();
            analyticsCommunicator.logLoadProjectFromStorage();
        }
    }

    const loadProjectFromFile = async (projectName: string, file: File) => {
        const processedImport = await blobToStore(file);

        appState.clear();
        project.clear();
        project.setImportedData(processedImport.project);
        project.setName(projectName);
        project.setDemoMode(false);
        appState.setImportedData(processedImport.appState, project);
        
        // Track project loading from file
        const analyticsCommunicator = new AnalyticsCommunicator();
        analyticsCommunicator.logLoadProjectFromFile();
    }

    const loadProjectFromSample = async (sample: SampleData) => {
        appState.clear();
        project.clear();

        project.setName("Demo project");
        project.setDemoMode(true);
        const groupId = project.addGroup(sample.environment);
        for (const dataset of sample.datasets) {
            project.getGroup(groupId)?.addAnalysis(dataset.name, dataset.data.join('\n'), DEMO_ANALYSIS_CONFIG);
        }
        
        // Track demo project loading
        const analyticsCommunicator = new AnalyticsCommunicator();
        analyticsCommunicator.logLoadDemoProject();
    }

    const loadProjectFromReprocessed = async (accession: string, files: ReprocessedFile[]) => {
        appState.clear();
        project.clear();

        project.setName(accession);
        project.setDemoMode(true);
        const groupId = project.addGroup(accession);
        for (const file of files) {
            project.getGroup(groupId)?.addAnalysis(file.name, file.rawPeptides, DEMO_ANALYSIS_CONFIG, file.intensities);
        }

        // Track reprocessed project loading
        const analyticsCommunicator = new AnalyticsCommunicator();
        analyticsCommunicator.logLoadReprocessedProject();
    }

    const loadProjectFromPeptides = async (rawPeptides: string, config: AnalysisConfig) => {
        appState.clear();
        project.clear();
        project.setName("Quick analysis");
        project.setDemoMode(true);
        const groupId = project.addGroup("Group");
        project.getGroup(groupId)?.addAnalysis("Sample", rawPeptides, config);
            
        // Track quick analysis
        const analyticsCommunicator = new AnalyticsCommunicator();
        analyticsCommunicator.logQuickAnalysis();
    }

    const deleteProject = async (projectName: string) => {
        await store.removeItem(projectName);
    }

    watchDebounced([ project, customDatabases, appState ], async () => {
        if (!project.isDemoMode && project.name) {
            let totalPeptides = 0;
            for (const group of project.groups) {
                for (const analysis of group.analyses) {
                    totalPeptides += analysis.peptides.length;
                }
            }

            const processedBlob = await storeToBlob(project, appState);

            await store.setItem(project.name, {
                lastAccessed: Date.now(),
                totalPeptides: totalPeptides,
                project: processedBlob.content,
            });
        }
    }, { deep: true, debounce: 1000, maxWait: 5000 });

    return {
        project,
        importStatus,

        getProjects,
        loadNewProject,
        loadProjectFromStorage,
        loadProjectFromFile,
        loadProjectFromSample,
        loadProjectFromReprocessed,
        loadProjectFromPeptides,
        deleteProject
    }
});

export default useUnipeptAnalysisStore;
