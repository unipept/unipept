import Sample from "./Sample";
import {FunctionalAnnotations, GroupedFA} from "../fa/FunctionalAnnotations";
import worker from "./worker";
import GOTerms from "../fa/goterms";
import ECNumbers from "../fa/ecnumbers";

export default class NewResultSet {
    private dataset: Sample;
    private config: MPAConfig;
    // TODO set correct MAP type
    private processedPeptides;
    private missedPeptides: string[];
    private fa: FunctionalAnnotations;
    private baseFa: GroupedFA;
    private progress: number;
    private wrkr;

    private numberOfMatchedPeptides: number;
    private numberOfSearchedForPeptides: number;

    /**
     * Creates a result set for a given dataset and search settings
     *
     * @param  {Dataset} dataset The dataset for which to create the result set
     * @param  {MPAConfig} mpaConfig
     */
    constructor(dataset: Sample, mpaConfig: MPAConfig) {
        this.dataset = dataset;
        this.config = mpaConfig;
        this.processedPeptides = null;
        this.missedPeptides = [];
        this.fa = null;
        this.baseFa = {
            ec: null,
            go: null
        };
        this.progress = 0;
        this.wrkr = worker();
        this.wrkr.onmessage = m => {
            if (m.data.type == "progress") {
                this.setProgress(m.data.value);
            }
        };
    }

    /**
     * Processes the list of peptides set in the dataset and returns a
     * taxonomic tree.
     */
    async process() {
        let {processed, missed, numMatched, numSearched} = await this.wrkr.process(this.dataset.originalPeptides, this.config);
        this.processedPeptides = new Map();
        for (const p of processed) {
            this.processedPeptides.set(p.sequence, p);
        }
        this.missedPeptides = missed;
        this.numberOfMatchedPeptides = numMatched;
        this.numberOfSearchedForPeptides = numSearched;
    }

    /**
     * Sets the progress of processing the result and emits the value on the
     * event bus.
     *
     * @param value The new progress value
     */
    setProgress(value: number) {
        this.progress = value;
        eventBus.emit("dataset-progress", value);
        eventBus.emit("dataset-" + this.dataset.id + "-progress", value);
    }

    /**
     * Converts the current analysis to the csv format. Each row contains a
     * peptide and its lineage, with each column being a level in the taxonomy
     *
     * @return The analysis result in csv format
     */
    toCSV(): Promise<string> {
        return this.wrkr.getCSV(Array.from(this.dataset.taxonMap.entries()));
    }

    /**
     * Returns the number of matched peptides, taking the deduplication setting
     * into account.
     *
     * @return The number of matched peptides
     */
    getNumberOfMatchedPeptides(): number {
        return this.numberOfMatchedPeptides;
    }

    /**
     * Returns the number of searched for peptides, taking the deduplication
     * setting into account.
     *
     * @return The number of searched for peptides
     */
    getNumberOfSearchedForPeptides(): number {
        return this.numberOfSearchedForPeptides;
    }

    /**
     * Calculate functional analysis
     * @param cutoff
     * @param sequences
     */
    async proccessFA(cutoff: number = 50, sequences: Iterable<string> = null) {
        console.log('RESULTSET REPROCESS');
        const [go, ec] = await Promise.all([
            this.summarizeGo(cutoff, sequences),
            this.summarizeEc(cutoff, sequences),
        ]);

        this.fa = new GroupedFA("Functional annotations", {
            "GO": go,
            "EC": ec,
        }, s => s.startsWith("GO:") ? "GO" : "EC");
    }

    /**
     * Returns a list of sequences that have the specified FA term
     * @param faName The name of the FA term (GO:000112, EC:1.5.4.1)
     * @param sequences List of sequences to limit to
     * @return A list of objects representing the matchesFunctionalAnnotations
     */
    getPeptidesByFA(faName: string, sequences: string[]): Promise<{sequence, hits, type, annotatedCount,allCount,relativeCount,count}[]> {
        return this.wrkr.getPeptidesByFA(faName, sequences);
    }

    /**
     * Fill `this.go` with a Map<string,GoInfo[]> per namespace. The values of the
     * maps have an additional `value` field that indicates the weight of that
     * GO number.
     * @param percent ignore data weighing less (to be removed)
     * @param sequences subset of sequences to take into account, null to consider all
     * @return GO term data
     */
    async summarizeGo(percent: number = 50, sequences: Iterable<string> = null): Promise<GOTerms> {
        // Find used go term and fetch data about them
        GOTerms.ingestGoData(await this.wrkr.getGoData());
        const {data, trust} = await this.wrkr.summarizeGo(percent, sequences);
        console.log("DATA");
        console.log(data);
        const go = await GOTerms.makeAssured(data, trust);
        return go;
    }

    /**
     * Fill `this.ec` with a Map<string,EcInfo[]>. The values of the map
     * have an additional `value` field that indicated the weight of that
     * EC number.
     * @param percent ignore data weighing less (to be removed)
     * @param sequences subset of sequences to take into account, null to consider all
     * @return an EC result set
     */
    async summarizeEc(percent: number = 50, sequences: Iterable<String> = null): Promise<ECNumbers> {
        const {data, trust} = await this.wrkr.summarizeEc(percent, sequences);
        const ec = ECNumbers.makeAssured(data, trust);
        return ec;
    }
}
