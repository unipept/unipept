import {ref, Ref} from "vue";
import ProteinResponseCommunicator, {
    MetaProteinResponse,
    ProteinResponse
} from "@/logic/communicators/unipept/protein/ProteinResponseCommunicator";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";


export default function useProteinProcessor(
    baseUrl = DEFAULT_API_BASE_URL
) {
    const proteins: Ref<ProteinResponse[]> = ref([]);
    const lca: Ref<number> = ref(-1);
    const commonLineage: Ref<number[]> = ref([]);

    const process = async (peptide: string, equate: boolean) => {
        const proteinCommunicator = new ProteinResponseCommunicator(baseUrl);
        const proteinData: MetaProteinResponse | undefined = await proteinCommunicator.getResponse(peptide, equate);

        if (proteinData) {
            proteins.value = proteinData.proteins;
            lca.value = proteinData.lca;
            commonLineage.value = proteinData.common_lineage;
        }
    }

    return {
        proteins,
        lca,
        commonLineage,

        process
    }
}
