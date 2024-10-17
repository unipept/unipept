import {AnalysisConfig, AnalysisStatus} from "@/components/pages/TestPage.vue";
import {computed, ref} from "vue";
import {defineStore} from "pinia";
import usePept2filtered from "@/composables/new/communication/unipept/usePept2filtered";
import usePeptideProcessor from "@/composables/new/processing/peptide/usePeptideProcessor";
import usePeptideTrustProcessor from "@/composables/new/processing/peptide/usePeptideTrustProcessor";
import useFunctionalProcessor from "@/composables/new/processing/functional/useFunctionalProcessor";
import useEcOntology from "@/composables/new/communication/useEcOntology";

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

    const data = ref<any | undefined>(undefined);

    // ===============================================================
    // ======================== PROCESSORS ===========================
    // ===============================================================

    const { process: processPept2Filtered } = usePept2filtered("http://0.0.0.0:80");

    const { process: processPeptides } = usePeptideProcessor();
    const { process: processPeptideTrust } = usePeptideTrustProcessor();
    const { process: processFunctional } = useFunctionalProcessor();

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================

    const peptides = computed(() => rawPeptides.value.split("\n").map(p => p.trim()).filter(p => p.length > 0));

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const analyse = async () => {
        status.value = AnalysisStatus.Running;

        // TODO: peptideCountTable could be a ref from the processor
        const peptideCountTable = await processPeptides(peptides.value, config.value.equate, config.value.filter);

        console.log(peptideCountTable);

        // TODO: peptideData/trust could be a ref from the processor
        const peptideData = await processPept2Filtered(peptideCountTable.keys(), config.value.equate);
        const peptideTrust = processPeptideTrust(peptideCountTable, peptideData);

        console.log(peptideTrust);

        //await new Promise(resolve => setTimeout(resolve, 1000));

        const buffers = peptideData.getBuffers();
        const {
            sortedCounts: ecToCount,
            itemToPeptides: ecToPeptides,
            annotatedCount
        } = await processFunctional(
            {
                peptideCounts: peptideCountTable,
                indexBuffer: buffers[0],
                dataBuffer: buffers[1],
                percentage: 5,
                termPrefix: "ec",
                proteinCountProperty: "ec"
            }
        );

        const x = useEcOntology();
        console.log(await x.process(Array.from(ecToCount.keys())));

        data.value = {
            peptideCountTable: peptideCountTable,
            trust: peptideTrust,
        };

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
        data,

        analyse,
        updateConfig,
        resetDirtyConfig,
        isConfigDirty,
    };
})();

export type SingleAnalysisStore = ReturnType<typeof useSingleAnalysisStore>;

export default useSingleAnalysisStore;
