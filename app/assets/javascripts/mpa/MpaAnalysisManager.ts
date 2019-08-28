import PeptideContainer from "./PeptideContainer";
import Sample from "./Sample";

export default class MpaAnalysisManager {
    async processDataset(peptideContainer: PeptideContainer, searchSettings: MPAConfig): Promise<void> {
        peptideContainer.setDataset(null);
        let peptides = await peptideContainer.getPeptides();
        let dataset: Sample = new Sample(peptides, peptideContainer.getId(), searchSettings, peptideContainer);

        peptideContainer.setDataset(dataset);
        // Force early analysis here
        await dataset.dataRepository.getWorker();
    }
}
