import {AnalysisConfig, AnalysisStatus} from "@/components/pages/TestPage.vue";
import {computed, ref} from "vue";
import {defineStore} from "pinia";
import usePept2filtered from "@/composables/new/communication/unipept/usePept2filtered";
import usePeptideProcessor from "@/composables/new/processing/usePeptideProcessor";
import usePeptideTrustProcessor from "@/composables/new/processing/usePeptideTrustProcessor";
import {CountTable} from "unipept-web-components";

const useSingleAnalysisStore = (
    _id: string,
    _name: string,
    _rawPeptides: string,
    _config: AnalysisConfig
) => defineStore(`singleSampleStore/${_id}`, () => {
    // ===============================================================
    // ======================== REFERENCES ===========================
    // ===============================================================

    const status = ref<AnalysisStatus>(AnalysisStatus.Pending);

    const id = ref<string>(_id);
    const name = ref<string>(_name);
    const rawPeptides = ref<string>(_rawPeptides);
    const config = ref<AnalysisConfig>({ ..._config });
    const dirtyConfig = ref<AnalysisConfig>({ ..._config });

    const { process: processPept2Filtered } = usePept2filtered("http://0.0.0.0:80");

    const { processOnWorker: processPeptides } = usePeptideProcessor();
    const { process: processPeptideTrust } = usePeptideTrustProcessor();

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================

    const peptides = computed(() => rawPeptides.value.split("\n").map(p => p.trim()).filter(p => p.length > 0));

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const analyse = async () => {
        status.value = AnalysisStatus.Running;

        const peptideCountTable = new CountTable<string>(
            ...await processPeptides(peptides.value, config.value.equate, config.value.filter)
        );

        const peptideData = await processPept2Filtered(peptideCountTable.getOntologyIds(), config.value.equate);

        console.log(peptideData);

        const peptideTrust = processPeptideTrust(peptideCountTable, peptideData);

        console.log(peptideTrust);

        await new Promise(resolve => setTimeout(resolve, 1000));

        status.value = AnalysisStatus.Finished
    }

    const updateConfig = () => {
        config.value = { ...dirtyConfig.value };
    }

    const resetDirtyConfig = () => {
        dirtyConfig.value = { ...config.value };
    }

    const isConfigDirty = () => {
        return config.value.equate !== dirtyConfig.value.equate
            || config.value.filter !== dirtyConfig.value.filter
            || config.value.missed !== dirtyConfig.value.missed
            || config.value.database !== dirtyConfig.value.database;
    }

    return {
        id,
        name,
        rawPeptides,
        peptides,
        config,
        dirtyConfig,
        status,

        analyse,
        updateConfig,
        resetDirtyConfig,
        isConfigDirty,
    };
})();

export type SingleAnalysisStore = ReturnType<typeof useSingleAnalysisStore>;

export default useSingleAnalysisStore;
