import {ref, Ref} from "vue";

import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import Protein from "@/logic/ontology/proteins/Protein";
import Pept2protCommunicator from "@/logic/communicators/unipept/protein/Pept2protCommunicator";
import useNcbiOntology from "@/composables/ontology/useNcbiOntology";
import LcaProcessor from "@/logic/processors/taxonomic/LcaProcessor";


export default function useProteinProcessor(
    baseUrl = DEFAULT_API_BASE_URL
) {
    const proteins: Ref<Protein[]> = ref([]);
    const lca: Ref<number> = ref(-1);
    const commonLineage: Ref<number[]> = ref([]);

    const process = async (peptide: string, equate: boolean) => {
        const pept2protCommunicator = new Pept2protCommunicator(baseUrl);
        const pept2protResponses = await pept2protCommunicator.getResponses(peptide, equate);

        if (!pept2protResponses || pept2protResponses.length === 0) {
            lca.value = -1;
            commonLineage.value = [];
            proteins.value = [];
        }

        // Prepare all the proteins
        proteins.value = pept2protResponses.map(p => {
            return {
                id: p.uniprot_id,
                name: p.protein_name,
                databaseType: "Unknown",
                taxonId: p.taxon_id,
                ecReferences: p.ec_references.split(" "),
                goReferences: p.go_references.split(" "),
                interproReferences: p.interpro_references.split(" ")
            }
        })

        const {ontology: ncbiOntology, update: updateNcbiOntology} = useNcbiOntology(baseUrl, DEFAULT_ONTOLOGY_BATCH_SIZE);
        const organismIds = pept2protResponses.map(p => p.taxon_id);

        await updateNcbiOntology(organismIds, true);

        const taxonList = organismIds.map(id => ncbiOntology.get(id)).filter(x => x !== undefined && x !== null);
        const lcaProcessor = new LcaProcessor();
        const lcaId = lcaProcessor.computeLca(taxonList);

        lca.value = lcaId;

        if (lcaId === 1) {
            commonLineage.value = [];
        } else {
            // We are sure that the lca is already in the ncbi ontology, otherwise we couldn't have used it as input for the
            // lca computation.
            commonLineage.value = ncbiOntology.get(lca.value)!.lineage;
        }
    }

    return {
        proteins,
        lca,
        commonLineage,

        process
    }
}
