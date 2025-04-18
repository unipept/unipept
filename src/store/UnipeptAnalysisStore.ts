import {defineStore} from "pinia";
import useProjectAnalysisStore, {useProjectAnalysisStoreImport} from "@/store/ProjectAnalysisStore";
import {watchDebounced} from "@vueuse/core";
import localforage from "localforage";
import useProjectExport from "@/components/project/export/useProjectExport";
import useProjectImport from "@/components/project/import/useProjectImport";
import useSampleDataStore from "@/store/SampleDataStore";
import {SampleData} from "@/composables/communication/unipept/useSampleData";
import {computed, ref} from "vue";
import {AnalysisConfig} from "@/store/AnalysisConfig";

const useUnipeptAnalysisStore = defineStore('PersistedAnalysisStore', () => {
    const store = localforage.createInstance({
        driver: localforage.INDEXEDDB,
        storeName: 'projects',
        name: 'unipept',
    });

    const { process: storeToBlob } = useProjectExport();
    const { process: blobToStore } = useProjectImport();

    const project = useProjectAnalysisStore();

    const isDemoMode = ref(false);

    const loadNewProject = async () => {
        isDemoMode.value = false;

        project.clear();
    }

    const loadProjectFromStorage = async (projectName: string) => {
        isDemoMode.value = false;

        const blob = await store.getItem(projectName);
        if (blob !== null) {
            project.clear();
            project.setImportedData(await blobToStore(blob));
        }
    }

    const loadProjectFromFile = async (file: File) => {
        isDemoMode.value = false;

        project.clear();
        project.setImportedData(await blobToStore(file));
    }

    const loadProjectFromSample = async (sample: SampleData) => {
        isDemoMode.value = true;

        project.clear();

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

    const loadProjectFromPeptides = async (rawPeptides: string[], config: AnalysisConfig) => {
        isDemoMode.value = true;

        project.clear();
        const groupId = project.addGroup("Quick analysis");
        project.getGroup(groupId)?.addAnalysis("Sample", rawPeptides, config);
    }

    watchDebounced(project, async () => {
        if (!isDemoMode.value) {
            await store.setItem('project', storeToBlob(project));
        }
    }, { deep: true, debounce: 3000, maxWait: 3000 });

    return {
        project,
        isDemoMode,

        loadNewProject,
        loadProjectFromStorage,
        loadProjectFromFile,
        loadProjectFromSample,
        loadProjectFromPeptides
    }
});

export default useUnipeptAnalysisStore;
