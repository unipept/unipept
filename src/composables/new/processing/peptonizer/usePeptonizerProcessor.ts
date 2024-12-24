import {ref} from "vue";
import {Peptonizer, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import CountTable from "@/logic/new/CountTable";
import useNcbiOntology from "@/composables/new/ontology/useNcbiOntology";

export const PEPTONIZER_WORKERS = 2;

export default function usePeptonizerProcessor() {
    const peptonizerResult = ref<Map<string, number>>();

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

        console.log("Peptide table");
        console.log(peptideTable);

        console.log("Peptide intensities");
        console.log(peptideIntensities);

        console.log(`Rank: ${rank}`);
        console.log(`Taxa in graph: ${taxaInGraph}`);

        const taxaIdToConfidence = await peptonizer.peptonize(
            peptideIntensities,
            new Map<string, number>(Array.from(peptideTable.entries())),
            alphas,
            betas,
            priors,
            rank,
            taxaInGraph,
            listener,
            PEPTONIZER_WORKERS
        );

        // Convert the labels from taxon IDs to taxon names
        const ncbiOntologyUpdater = useNcbiOntology();
        await ncbiOntologyUpdater.update([...taxaIdToConfidence.keys().map((label) => Number.parseInt(label as string))], false);

        const ncbiOntology = ncbiOntologyUpdater.ontology;
        peptonizerResult.value = new Map(taxaIdToConfidence.entries().map(([k, v]) => [ncbiOntology.value.get(Number.parseInt(k))!.name, v]));
    }

    return {
        peptonizerResult,
        process
    }
}
