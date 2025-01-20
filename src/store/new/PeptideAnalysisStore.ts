import {AnalysisConfig} from "@/store/new/AnalysisConfig";
import {ref} from "vue";
import {AnalysisStatus} from "@/store/new/AnalysisStatus";
import useOntologyStore from "@/store/new/OntologyStore";
import useProteinProcessor from "@/composables/new/processing/protein/useProteinProcessor";
import {defineStore} from "pinia";
import useEcProcessor from "@/composables/new/processing/functional/useEcProcessor";
import useGoProcessor from "@/composables/new/processing/functional/useGoProcessor";
import useInterproProcessor from "@/composables/new/processing/functional/useInterproProcessor";
import usePept2filtered from "@/composables/new/communication/unipept/usePept2filtered";
import CountTable from "@/logic/new/CountTable";
import useTaxonomicProcessor from "@/composables/new/processing/taxonomic/useTaxonomicProcessor";

const usePeptideAnalysisStore = (
    _id: string,
    _peptide: string,
    _config: AnalysisConfig
) => defineStore(`peptideAnalyssiStore/${_id}`, () => {
    const ontologyStore = useOntologyStore();

    // ===============================================================
    // ======================== REFERENCES ===========================
    // ===============================================================

    const status = ref<AnalysisStatus>(AnalysisStatus.Pending);

    const id = ref<string>(_id);
    const peptide = ref<string>(_peptide);
    const config = ref<AnalysisConfig>(_config);

    // ===============================================================
    // ======================== PROCESSORS ===========================
    // ===============================================================

    const { peptideData: peptideToData, process: processPept2Filtered } = usePept2filtered();
    const { proteins, lca, commonLineage, process: processProteins } = useProteinProcessor();

    const { countTable: ecTable, trust: ecTrust, ecToPeptides, process: processEc } = useEcProcessor();
    const { countTable: goTable, trust: goTrust, goToPeptides, process: processGo } = useGoProcessor();
    const { countTable: iprTable, trust: iprTrust, iprToPeptides, process: processInterpro } = useInterproProcessor();

    const analyse = async () => {
        status.value = AnalysisStatus.Running;

        const peptideTable: CountTable<string> = new CountTable(new Map<string, number>([[peptide.value, 1]]));

        await processPept2Filtered([peptide.value], config.value.equate);

        await processProteins(peptide.value, config.value.equate);

        await processEc(peptideTable, peptideToData.value!);
        await processGo(peptideTable, peptideToData.value!);
        await processInterpro(peptideTable, peptideToData.value!);

        // Add all organism IDs for which we need detailed information from the NCBI ontology
        const lcaSet: Set<number> = new Set();
        lcaSet.add(lca.value);
        for (const protein of proteins.value) {
            lcaSet.add(protein.organism);
        }
        for (const ncbiId of commonLineage.value) {
            lcaSet.add(ncbiId);
        }


        await ontologyStore.updateEcOntology(Array.from(ecToPeptides.value!.keys()));
        await ontologyStore.updateGoOntology(Array.from(goToPeptides.value!.keys()));
        await ontologyStore.updateIprOntology(Array.from(iprToPeptides.value!.keys()));
        await ontologyStore.updateNcbiOntology([...lcaSet]);

        status.value = AnalysisStatus.Finished;
    }

    return {
        id,
        peptide,
        config,
        status,

        peptideToData,
        proteins,
        lca,
        commonLineage,
        ecTable,
        ecTrust,
        ecToPeptides,
        goTable,
        goTrust,
        goToPeptides,
        iprTable,
        iprTrust,
        iprToPeptides,

        analyse
    }
})();

export type PeptideAnalysisStore = ReturnType<typeof usePeptideAnalysisStore>;

export default usePeptideAnalysisStore;
