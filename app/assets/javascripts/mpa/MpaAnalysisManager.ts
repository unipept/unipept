import PeptideContainer from "./PeptideContainer";
import {Dataset} from "./dataset";
import SearchSettings from "./SearchSettings";

export default class MpaAnalysisManager {
    public static readonly RANKS: string[] = ["superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species group", "species subgroup", "species", "subspecies", "varietas", "forma"];
    public static readonly GO_NAMESPACES: string[] = ["biological process", "cellular component", "molecular function"];

    async processDataset(peptideContainer: PeptideContainer, searchSettings: SearchSettings): Promise<void> {
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
