import {MPA} from "./index.js";
import GOTerms from "../components/goterms.js";
import ECNumbers from "../components/ecnumbers.js";
import {numberToPercent} from "../utils.js";

import worker from "workerize-loader!./worker.js";

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
 * @param {GOTerms} go
 * @param {ECNumbers} ec
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
        this.fa = {ec: null, go: null};
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
        this.processedPeptides = new Map(processed);
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
     * @return {string} The analysis result in csv format
     */
    toCSV() {
        let result = "peptide,lca," +
                    MPA.RANKS.join(",") + "," +
                    "EC," +
                    GOTerms.NAMESPACES.map(ns => `GO (${ns})`).join(",") +
                    "\n";
        for (const peptide of this.processedPeptides.values()) {
            let row = peptide.sequence + ",";
            row += this.dataset.taxonMap.get(peptide.lca).name + ",";
            row += peptide.lineage.map(e => {
                if (e === null) return "";
                return this.dataset.taxonMap.get(e).name;
            }).join(",");


            row += ",";
            row += peptide.faGrouped.EC.sort((a, b) => b.value - a.value)
                .slice(0, 3)
                .map(a => `${a.code} (${numberToPercent(a.value / peptide.fa.counts.EC)})`)
                .join(";");
            row += ",";
            row += GOTerms.NAMESPACES.map(ns =>
                (peptide.faGrouped.GO[ns] || [])
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 3)
                    .map(a => `${a.code} (${numberToPercent(a.value / peptide.fa.counts.GO)})`)
                    .join(";"))
                .join(",");

            row += "\n";
            result += row.repeat(peptide.count);
        }
        return result;
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

        this.fa.go = go;
        this.fa.ec = ec;
    }

    /**
     * Returns a list of sequences that have the specified FA term
     * @param {String} faName The name of the FA term (GO:000112, EC:1.5.4.1)
     * @return {{sequence, totalCount, relativeCount}[]} A list of objects representing
     *                                                   the matches
     */
    getPeptidesByFA(faName) {
        const type = faName.split(":")[0];
        return [...this.processedPeptides.values()]
            .filter(pept => faName in pept.fa.data)
            .map(pept => ({
                sequence: pept.sequence,
                totalCount: pept.fa.data[faName],
                relativeCount: pept.fa.data[faName] / pept.fa.counts[type],
            }));
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
        const go = await GOTerms.makeAssured({data: await this.wrkr.summarizeGo(percent, sequences)});
        this.fa.go = go;
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
        const wrkrEC = await this.wrkr.summarizeEc(percent, sequences);
        const ec = ECNumbers.makeAssured(wrkrEC);
        this.fa.ec = ec;
        return ec;
    }
}

export {Resultset};
