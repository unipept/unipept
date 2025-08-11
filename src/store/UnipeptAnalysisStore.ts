import {defineStore} from "pinia";
import useProjectAnalysisStore from "@/store/ProjectAnalysisStore";
import localforage from "localforage";
import {SampleData} from "@/composables/communication/unipept/useSampleData";
import {computed} from "vue";
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
}

const useUnipeptAnalysisStore = defineStore('PersistedAnalysisStore', () => {
    const store = localforage.createInstance({
        driver: localforage.INDEXEDDB,
        storeName: 'projects',
        name: 'unipept',
    });

    const { process: storeToBlob } = useProjectExport();
    const { process: blobToStore } = useProjectImport();

    const project = useProjectAnalysisStore();
    const customDatabases = useCustomFilterStore();
    const appState = useAppStateStore();

    const getProjects = async () => {
        const keys = await store.keys();
        return await Promise.all(keys.map(async (key) => {
            const value: StoreValue | null = await store.getItem(key);
            return {
                name: key,
                totalPeptides: value!.totalPeptides,
                lastAccessed: new Date(value!.lastAccessed)
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
        analyticsCommunicator.logCreateNewProject(projectName);
    }

    const loadProjectFromStorage = async (projectName: string) => {
        const value: StoreValue | null = await store.getItem(projectName);
        if (value !== null) {
            appState.clear();
            project.clear();

            const processedImport = await blobToStore(value.project);

            project.setImportedData(processedImport.project);
            project.setName(projectName);
            project.setDemoMode(false);
            appState.setImportedData(processedImport.appState, project);
            
            // Track project loading
            const analyticsCommunicator = new AnalyticsCommunicator();
            analyticsCommunicator.logLoadProjectFromStorage(projectName);
        }
    }

    const loadProjectFromFile = async (projectName: string, file: File) => {
        appState.clear();
        project.clear();

        const processedImport = await blobToStore(file);

        project.setImportedData(processedImport.project);
        project.setName(projectName);
        project.setDemoMode(false);
        appState.setImportedData(processedImport.appState, project);
        
        // Track project loading from file
        const analyticsCommunicator = new AnalyticsCommunicator();
        analyticsCommunicator.logLoadProjectFromFile(projectName);
    }

    const loadProjectFromSample = async (sample: SampleData) => {
        appState.clear();
        project.clear();

        project.setName("Demo project");
        project.setDemoMode(true);
        const groupId = project.addGroup(sample.environment);
        for (const dataset of sample.datasets) {
            project.getGroup(groupId)?.addAnalysis(dataset.name, dataset.data.join('\n'), {
                equate: true,
                filter: true,
                missed: true,
                database: UNIPROT_ID
            });
        }
        
        // Track demo project loading
        const analyticsCommunicator = new AnalyticsCommunicator();
        analyticsCommunicator.logLoadDemoProject(sample.environment);
    }

    const loadProjectFromPeptides = async (rawPeptides: string, config: AnalysisConfig) => {
        appState.clear();
        project.clear();
        project.setName("Quick analysis");
        project.setDemoMode(true);
        const groupId = project.addGroup("Group");
        project.getGroup(groupId)?.addAnalysis("Sample", rawPeptides, config);
        
        // Count the number of peptides
        const peptideCount = rawPeptides.split(/\r?\n/)
            .filter(line => line.trim().length > 0)
            .length;
            
        // Track quick analysis
        const analyticsCommunicator = new AnalyticsCommunicator();
        analyticsCommunicator.logQuickAnalysis(peptideCount, config);
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

        getProjects,
        loadNewProject,
        loadProjectFromStorage,
        loadProjectFromFile,
        loadProjectFromSample,
        loadProjectFromPeptides,
        deleteProject
    }
});

export default useUnipeptAnalysisStore;
