import {ref} from "vue";
import {defineStore} from "pinia";
import useSingleAnalysisStore from "@/store/new/SingleAnalysisStore";
import CountTable from "@/logic/new/CountTable";
import usePeptonizerProcessor, {
    PEPTONIZER_WORKERS
} from "@/composables/new/processing/peptonizer/usePeptonizerProcessor";
import {NcbiRank} from "@/logic/new/ontology/taxonomic/Ncbi";
import {Peptonizer, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import useNcbiOntology from "@/composables/new/ontology/useNcbiOntology";

export enum PeptonizerStatus {
    Pending,
    Running,
    Finished
}

export const DEFAULT_PEPTIDE_INTENSITIES: number = 0.7;

const usePeptonizerStore = () => defineStore(`peptonizerStore`, () => {
    const status = ref<PeptonizerStatus>(PeptonizerStatus.Pending);
    const taxaIdsToConfidence = ref<Map<number, number> | undefined>();
    const taxaNamesToConfidence = ref<Map<string, number> | undefined>();

    let peptonizer: Peptonizer | undefined;

    const runPeptonizer = async (
        peptideCountTable: CountTable<string>,
        peptideIntensities?: Map<string, number>,
        rank: NcbiRank,
        taxaInGraph: number,
        listener: PeptonizerProgressListener,
        equateIl: boolean
    ) => {
        status.value = PeptonizerStatus.Running;

        // Reset to initial values
        taxaIdsToConfidence.value = undefined;
        taxaNamesToConfidence.value = undefined;

        // If no intensities are provided, we set them to the default value
        if (!peptideIntensities) {
            peptideIntensities = new Map<string, number>(Array.from(peptideCountTable.keys()).map((peptide: string) => [peptide, DEFAULT_PEPTIDE_INTENSITIES]));
        }

        // If the equate I / L option is enabled, we need to update the intensities as well
        if (equateIl) {
            // TODO: we need to think about this equation of I and L for the peptonizer again...
            peptideIntensities = new Map<string, number>(Array.from(peptideIntensities.entries()).map(([k, v]) => [k.replace(/I/g, "L"), v]))
        }

        // These are the parameters over which the Peptonizer will run a grid search and look for the optimal result
        const alphas = [0.8, 0.9, 0.99];
        const betas = [0.6, 0.7, 0.8, 0.9];
        const priors = [0.3, 0.5];

        peptonizer = new Peptonizer();

        const peptonizerData = await peptonizer.peptonize(
            peptideIntensities,
            new Map<string, number>(Array.from(peptideCountTable.entries())),
            alphas,
            betas,
            priors,
            rank,
            taxaInGraph,
            listener,
            PEPTONIZER_WORKERS
        );

        // No data is returned by the peptonizer if it's execution has been cancelled by the user
        if (!peptonizerData) {
            status.value = PeptonizerStatus.Pending;
            return;
        }

        taxaIdsToConfidence.value = new Map<number, number>(peptonizerData.entries().map(([k, v]) => [Number.parseInt(k), v]));

        // Convert the labels from taxon IDs to taxon names
        const ncbiOntologyUpdater = useNcbiOntology();
        await ncbiOntologyUpdater.update(Array.from(taxaIdsToConfidence.value.keys()), false);

        const ncbiOntology = ncbiOntologyUpdater.ontology;
        taxaNamesToConfidence.value = new Map(Array.from(taxaIdsToConfidence.value.entries()).map(([k, v]) => [ncbiOntology.value.get(k)!.name, v]));

        status.value = PeptonizerStatus.Finished;
    }

    const cancelPeptonizer = async () => {
        if (peptonizer) {
            await peptonizer.cancel();
        }
        status.value = PeptonizerStatus.Pending;
    }

    return {
        status,
        taxaNamesToConfidence,
        taxaIdsToConfidence,
        runPeptonizer,
        cancelPeptonizer
    }
})();

export type PeptonizerStore = ReturnType<typeof useSingleAnalysisStore>;

export default usePeptonizerStore;
