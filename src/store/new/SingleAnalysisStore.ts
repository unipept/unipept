import {AnalysisConfig, AnalysisStatus} from "@/components/pages/TestPage.vue";
import {computed, ref} from "vue";
import {defineStore} from "pinia";
import usePept2filtered from "@/composables/new/communication/unipept/usePept2filtered";
import usePeptideProcessor from "@/composables/new/processing/peptide/usePeptideProcessor";
import usePeptideTrustProcessor from "@/composables/new/processing/peptide/usePeptideTrustProcessor";
import useFunctionalProcessor from "@/composables/new/processing/functional/useFunctionalProcessor";
import useEcOntology from "@/composables/new/communication/useEcOntology";
import useEcProcessor from "@/composables/new/processing/functional/useEcProcessor";
import useGoProcessor from "@/composables/new/processing/functional/useGoProcessor";
import useInterproProcessor from "@/composables/new/processing/functional/useInterproProcessor";

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

    // ===============================================================
    // ======================== PROCESSORS ===========================
    // ===============================================================

    const { peptideData, process: processPept2Filtered } = usePept2filtered("http://0.0.0.0:80");

    const { countTable: peptidesTable, process: processPeptides } = usePeptideProcessor();
    const { trust: peptideTrust, process: processPeptideTrust } = usePeptideTrustProcessor();
    const { countTable: ecTable, trust: ecTrust, ecToPeptides, process: processEc } = useEcProcessor();
    const { countTable: goTable, trust: goTrust, goToPeptides, process: processGo } = useGoProcessor();
    const { countTable: iprTable, trust: iprTrust, iprToPeptides, process: processInterpro } = useInterproProcessor();

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================

    const peptides = computed(() =>
        rawPeptides.value.split("\n").map(p => p.trim()).filter(p => p.length > 0)
    );

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const analyse = async () => {
        status.value = AnalysisStatus.Running;

        await processPeptides(peptides.value, config.value.equate, config.value.filter);

        await processPept2Filtered([...peptidesTable.value.keys()], config.value.equate);
        processPeptideTrust(peptidesTable.value, peptideData.value);

        await processEc(peptidesTable.value, peptideData.value, 5);
        await processGo(peptidesTable.value, peptideData.value, 5);
        await processInterpro(peptidesTable.value, peptideData.value, 5);

        console.log(iprTable.value);
        console.log(iprTrust.value);

        //await new Promise(resolve => setTimeout(resolve, 1000));

        // const x = useEcOntology();
        // console.log(await x.process(Array.from(ecToCount.keys())));

        status.value = AnalysisStatus.Finished
    }

    const filterPercentage = () => {
        // TODO: only need to update EcTable, GoTable and IprTable
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

        peptidesTable,
        peptideTrust,
        ecTable,
        ecTrust,
        ecToPeptides,
        goTable,
        goTrust,
        goToPeptides,
        iprTable,
        iprTrust,
        iprToPeptides,

        analyse,
        updateConfig,
        resetDirtyConfig,
        isConfigDirty,
    };
})();

export type SingleAnalysisStore = ReturnType<typeof useSingleAnalysisStore>;

export default useSingleAnalysisStore;
