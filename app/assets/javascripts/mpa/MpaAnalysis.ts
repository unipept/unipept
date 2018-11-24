import NewPeptideContainer from "./NewPeptideContainer";
import {Dataset} from "./dataset";
import SearchSettings from "./SearchSettings";

export default class MpaAnalysis {
    async processDataset(peptideContainer: NewPeptideContainer, searchSettings: SearchSettings): Promise<Dataset> {
        let peptides = await peptideContainer.getPeptides();
        let dataset = new Dataset(peptides, peptideContainer.getId());
        await this.analyse(dataset, searchSettings);
        return dataset;
    }

    private async analyse(dataset: Dataset, searchSettings: SearchSettings) {
        let mpaConfig = {
            il: searchSettings.isEquateIl(),
            dupes: searchSettings.isFilterDuplicates(),
            missed: searchSettings.isHandleMissingCleavage()
        };
        await dataset.search(mpaConfig);
    }
}
