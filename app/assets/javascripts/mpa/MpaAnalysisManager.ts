import PeptideContainer from "./PeptideContainer";
import Sample from "./Sample";

export default class MpaAnalysisManager {
    public static readonly RANKS: string[] = ["superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species group", "species subgroup", "species", "subspecies", "varietas", "forma"];
    public static readonly GO_NAMESPACES: string[] = ["biological process", "cellular component", "molecular function"];

    async processDataset(peptideContainer: PeptideContainer, searchSettings: MPAConfig): Promise<void> {
        peptideContainer.setDataset(null);
        let peptides = await peptideContainer.getPeptides();
        let dataset: Sample = new Sample(peptides, peptideContainer.getId(), searchSettings, peptideContainer);

        peptideContainer.setDataset(dataset);
        // Force early analysis here
        await dataset.dataRepository.getWorker();
    }
}
