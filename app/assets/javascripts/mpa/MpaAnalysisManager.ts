import Sample from "./Sample";
import { Assay } from "./assay/Assay";

export default class MpaAnalysisManager 
{
    async processDataset(dataset: Assay, searchSettings: MPAConfig): Promise<void> 
    {
        await dataset.initDataRepository(searchSettings);
    }
}
