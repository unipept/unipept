import PeptideContainer from "./PeptideContainer";
import Sample from "./Sample";

export default class MpaAnalysisManager {
    async processDataset(peptideContainer: PeptideContainer, searchSettings: MPAConfig): Promise<void> {
        peptideContainer.setDataset(null);
        let dataset: Sample = new Sample(peptideContainer, searchSettings, peptideContainer);

        peptideContainer.setDataset(dataset);
        // Force early analysis here
        await dataset.dataRepository.processPeptideContainer();
    }
}
