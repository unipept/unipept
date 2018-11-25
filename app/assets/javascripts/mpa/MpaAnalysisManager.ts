import NewPeptideContainer from "./NewPeptideContainer";
import {Dataset} from "./dataset";
import SearchSettings from "./SearchSettings";

export default class MpaAnalysisManager {
    async processDataset(peptideContainer: NewPeptideContainer, searchSettings: SearchSettings): Promise<void> {
        peptideContainer.setDataset(null);
        let peptides = await peptideContainer.getPeptides();
        let dataset = new Dataset(peptides, peptideContainer.getId());

        eventBus.on('dataset-' + peptideContainer.getId() + "-progress", (p) => peptideContainer.setProgress(p));

        await this.analyse(dataset, searchSettings);
        peptideContainer.setDataset(dataset);
    }

    private async analyse(dataset: Dataset, searchSettings: SearchSettings): Promise<void> {
        let mpaConfig = {
            il: searchSettings.isEquateIl(),
            dupes: searchSettings.isFilterDuplicates(),
            missed: searchSettings.isHandleMissingCleavage()
        };
        await dataset.search(mpaConfig);
    }
}
