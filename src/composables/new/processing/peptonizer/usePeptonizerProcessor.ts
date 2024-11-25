import {ref} from "vue";
import {GridSearchProgressListener, Peptonizer, PeptonizerResult} from "peptonizer";
import CountTable from "@/logic/new/CountTable";

export default function usePeptonizerProcessor() {
    const peptonizerResult = ref<PeptonizerResult>();

    const process = async (
        peptideTable: CountTable<string>,
        listener: GridSearchProgressListener
    ): Promise<void> => {
        const peptonizer = new Peptonizer();

        // Temporarily set the scores of all the peptides to 0.7
        const peptideScores = new Map<string, number>();
        const peptideCounts = new Map<string, number>();

        for (const [peptide, count] of peptideTable.entries()) {
            peptideScores.set(peptide, 0.7);
            peptideCounts.set(peptide, count);
        }

        const alphas = [0.8, 0.9, 0.99];
        const betas = [0.6, 0.7, 0.8, 0.9];
        const priors = [0.3, 0.5];

        peptonizerResult.value = await peptonizer.peptonize(
            peptideScores,
            peptideCounts,
            alphas,
            betas,
            priors,
            listener
        );
    }

    return {
        peptonizerResult,
        process
    }
}
