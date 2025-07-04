import {defineStore} from "pinia";
import useProjectAnalysisStore from "@/store/ProjectAnalysisStore";
import localforage from "localforage";
import {SampleData} from "@/composables/communication/unipept/useSampleData";
import {computed, ref} from "vue";
import {AnalysisConfig} from "@/store/AnalysisConfig";
import useCustomFilterStore from "@/store/CustomFilterStore";
import useProjectExport from "@/composables/useProjectExport";
import useProjectImport from "@/composables/useProjectImport";
import useAppStateStore from "@/store/AppStateStore";
import {watchDebounced} from "@vueuse/core";

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

    const isDemoMode = computed(() => project.isDemoMode);

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
                database: "UniProtKB"
            });
        }
    }

    const loadProjectFromPeptides = async (rawPeptides: string, config: AnalysisConfig) => {
        appState.clear();
        project.clear();
        project.setName("Quick analysis");
        project.setDemoMode(true);
        const groupId = project.addGroup("Group");
        project.getGroup(groupId)?.addAnalysis("Sample", rawPeptides, config);
    }

    const deleteProject = async (projectName: string) => {
        await store.removeItem(projectName);
    }

    watchDebounced([ project, customDatabases, appState ], async () => {
        if (!isDemoMode.value) {
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
        isDemoMode,

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
