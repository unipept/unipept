import {ref} from "vue";
import {Peptonizer, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import CountTable from "@/logic/new/CountTable";
import useNcbiOntology from "@/composables/new/ontology/useNcbiOntology";

export const PEPTONIZER_WORKERS = 2;

export default function usePeptonizerProcessor() {
    const peptonizerResult = ref<Map<string, number>>();
    const taxonIdToConfidence = ref<Map<number, number>>();

    const process = async (
        peptideTable: CountTable<string>,
        peptideIntensities: Map<string, number>,
        rank: string,
        taxaInGraph: number,
        listener: PeptonizerProgressListener
    ): Promise<void> => {
        const peptonizer = new Peptonizer();

        const alphas = [0.8, 0.9, 0.99];
        const betas = [0.6, 0.7, 0.8, 0.9];
        const priors = [0.3, 0.5];

        taxonIdToConfidence.value = new Map<number, number>((await peptonizer.peptonize(
            peptideIntensities,
            new Map<string, number>(Array.from(peptideTable.entries())),
            alphas,
            betas,
            priors,
            rank,
            taxaInGraph,
            listener,
            PEPTONIZER_WORKERS
        )).entries().map(([k, v]) => [Number.parseInt(k), v]));

        // Convert the labels from taxon IDs to taxon names
        const ncbiOntologyUpdater = useNcbiOntology();
        await ncbiOntologyUpdater.update(Array.from(taxonIdToConfidence.value.keys()), false);

        const ncbiOntology = ncbiOntologyUpdater.ontology;
        peptonizerResult.value = new Map(Array.from(taxonIdToConfidence.value.entries()).map(([k, v]) => [ncbiOntology.value.get(k)!.name, v]));
    }

    return {
        peptonizerResult,
        taxonIdToConfidence,
        process
    }
}
