import GOTerms from "../fa/goterms.js";
import ECNumbers from "../fa/ecnumbers.js";
import "../fa/FunctionalAnnotations.js";

import worker from "workerize-loader!./worker.js";
import {GroupedFA} from "../fa/FunctionalAnnotations.js";
import {Dataset} from "./dataset.js";

/**
 * Represents the resultset for a given dataset.
 *
 * This is in fact a proxy for a worker thread that will be created
 * upon the insatntiation of this class (one worker per ResultSet object).
 *
 * The final results of the worker is duplicated to here. Intermediate
 * results saty in the worker to reduce the time taken to send data to
 * the thread
 *
 * @type {Resultset}
 */
class Resultset {
    /**
     * Creates a resultset for a given dataset and search settings
     *
     * @param  {Dataset} dataset The dataset for which to create the resultset
     * @param  {MPAConfig} mpaConfig
     */
    constructor(dataset, mpaConfig) {
        this.dataset = dataset;
        this.config = mpaConfig;
        this.processedPeptides = null;
        this.missedPeptides = [];
        this.fa = null;
        this.baseFa = {ec: null, go: null};
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
     * @param {number} value The new progress value
     */
    setProgress(value) {
        this.progress = value;
        eventBus.emit("dataset-progress", value);
    }


    /**
     * Converts the current analysis to the csv format. Each row contains a
     * peptide and its lineage, with each column being a level in the taxonomy
     *
     * @return {Promise<string>} The analysis result in csv format
     */
    toCSV() {
        return this.wrkr.getCSV(Array.from(this.dataset.taxonMap.entries()));
    }

    /**
     * Returns the number of matched peptides, taking the deduplication setting
     * into account.
     *
     * @return {number} The number of matched peptides
     */
    getNumberOfMatchedPeptides() {
        return this.numberOfMatchedPeptides;
    }

    /**
     * Returns the number of searched for peptides, taking the deduplication
     * setting into account.
     *
     * @return {number} The number of searched for peptides
     */
    getNumberOfSearchedForPeptides() {
        return this.numberOfSearchedForPeptides;
    }

    /**
     * Calculate functional analyis
     * @param {Number} cutoff
     * @param {Iterable<String>} sequences
     */
    async proccessFA(cutoff = 50, sequences = null) {
        const [go, ec] = await Promise.all([
            this.summarizeGo(cutoff, sequences),
            this.summarizeEc(cutoff, sequences),
        ]);

        this.fa = new GroupedFA("Functional annotaions", {
            "GO": go,
            "EC": ec,
        }, s => s.startsWith("GO:") ? "GO" : "EC");
    }

    /**
     * Returns a list of sequences that have the specified FA term
     * @param {String} faName The name of the FA term (GO:000112, EC:1.5.4.1)
     * @param {String[]} sequences List of sequences to limit to
     * @return {Promise<{sequence, hits, type, annotatedCount,allCount,relativeCount,count,lca,lcaName}[]>} A list of objects representing
     *                                                   the matchesFunctionalAnnotations
     */
    getPeptidesByFA(faName, sequences) {
        return this.wrkr.getPeptidesByFA(faName, sequences)
            .then(r => r.map(x => Object.assign(x, {lcaName: this.dataset.taxonMap.get(x.lca).name})));
    }

    /**
     * Fill `this.go` with a Map<string,GoInfo[]> per namespace. The values of the
     * maps have an additional `value` field that indicates the weight of that
     * GO number.
     * @param {Number} [percent=50] ignore data weighing less (to be removed)
     * @param {Iterable<String>} [sequences=null] subset of sequences to take into account,
     *                                    null to consider all
     * @return {Promise<GOTerms>} GO term data
     */
    async summarizeGo(percent = 50, sequences = null) {
        // Find used go term and fetch data about them

        GOTerms.ingestGoData(await this.wrkr.getGoData());
        const {data, trust} = await this.wrkr.summarizeGo(percent, sequences);
        const go = await GOTerms.makeAssured(data, trust);
        return go;
    }

    /**
     * Fill `this.ec` with a Map<string,EcInfo[]>. The values of the map
     * have an additional `value` field that indicated the weight of that
     * EC number.
     * @param {number} [percent=50] ignore data weighing less (to be removed)
     * @param {Iterable<String>} [sequences=null] subset of sequences to take into account,
     *                                    null to consider all
     * @return {Promise<ECNumbers>} an EC resultset
     */
    async summarizeEc(percent = 50, sequences = null) {
        const {data, trust} = await this.wrkr.summarizeEc(percent, sequences);
        const ec = ECNumbers.makeAssured(data, trust);
        return ec;
    }
}

export {Resultset};
