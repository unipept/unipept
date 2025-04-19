import {defineStore} from "pinia";
import useProjectAnalysisStore, {useProjectAnalysisStoreImport} from "@/store/ProjectAnalysisStore";
import {computedAsync, useStorageAsync, watchDebounced} from "@vueuse/core";
import localforage from "localforage";
import useProjectExport from "@/components/project/export/useProjectExport";
import useProjectImport from "@/components/project/import/useProjectImport";
import useSampleDataStore from "@/store/SampleDataStore";
import {SampleData} from "@/composables/communication/unipept/useSampleData";
import {computed, ref, shallowRef} from "vue";
import {AnalysisConfig} from "@/store/AnalysisConfig";
import useCustomFilterStore from "@/store/CustomFilterStore";

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

    const _projectName = ref<string>("");

    const isDemoMode = computed(() => {
        return _projectName.value === "";
    });

    const getProjects = async () => {
        const keys = await store.keys();
        return await Promise.all(keys.map(async (key) => {
            const value = await store.getItem(key);
            return {
                name: key,
                lastAccessed: new Date(value.lastAccessed)
            };
        }));
    }

    const loadNewProject = async (projectName: string) => {
        _projectName.value = projectName;

        project.clear();
    }

    const loadProjectFromStorage = async (projectName: string) => {
        _projectName.value = projectName;

        const blob = await store.getItem(projectName);
        if (blob !== null) {
            project.clear();
            project.setImportedData(await blobToStore(blob.project));
        }
    }

    const loadProjectFromFile = async (projectName: string, file: File) => {
        _projectName.value = projectName;

        project.clear();
        project.setImportedData(await blobToStore(file));
    }

    const loadProjectFromSample = async (sample: SampleData) => {
        _projectName.value = "";

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
        _projectName.value = "";

        project.clear();
        const groupId = project.addGroup("Quick analysis");
        project.getGroup(groupId)?.addAnalysis("Sample", rawPeptides, config);
    }

    const deleteProject = async (projectName: string) => {
        await store.removeItem(projectName);
    }

    watchDebounced([ project, customDatabases ], async () => {
        if (!isDemoMode.value) {
            await store.setItem(_projectName.value, {
                lastAccessed: Date.now(),
                project: await storeToBlob(project)
            });
        }
    }, { deep: true, debounce: 1000, maxWait: 1000 });

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
