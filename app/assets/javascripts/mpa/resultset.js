import {MPA} from "./index.js";
import {Dataset} from "./dataset.js";
/**
 * Represents the resultset for a given dataset
 *
 * @type {Resultset}
 */
class Resultset {
    /**
     * Creates a resultset for a given dataset and search settings
     *
     * @param  {Dataset} dataset The dataset for which to create the resultset
     * @param  {boolean} il equate il?
     * @param  {boolean} dupes filter duplicates?
     * @param  {boolean} missed advancedMissedCleavageHandling?
     */
    constructor(dataset, {il, dupes, missed}) {
        this.dataset = dataset;
        this.il = il;
        this.dupes = dupes;
        this.missed = missed;
        this.preparedPeptides = this.preparePeptides(dataset.originalPeptides, il, dupes, missed);
        this.processedPeptides = [];
        this.missedPeptides = [];
        this.progress = 0;
    }

    /**
     * Processes the list of peptides set in the dataset and returns a
     * taxonomic tree.
     */
    async process() {
        const peptideList = Array.from(this.preparedPeptides.keys());
        this.processedPeptides = [];
        this.setProgress(Dataset.BATCH_SIZE / peptideList.length);
        for (let i = 0; i < peptideList.length; i += Dataset.BATCH_SIZE) {
            const data = JSON.stringify({
                peptides: peptideList.slice(i, i + Dataset.BATCH_SIZE),
                equate_il: this.il,
                missed: this.missed,
            });
            const result = await Dataset.postJSON(Dataset.PEPT2LCA_URL, data);
            this.processedPeptides.push(...result.peptides);
            this.setProgress(this.progress + Dataset.BATCH_SIZE / peptideList.length);
        }
        for (const peptide of this.processedPeptides) {
            peptide.count = this.preparedPeptides.get(peptide.sequence);
        }
        this.setMissedPeptides(peptideList, this.processedPeptides);
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
     * Calculates the missed peptides and sets the object property
     */
    setMissedPeptides() {
        const foundPeptides = new Set(this.processedPeptides.map(p => p.sequence));
        this.missedPeptides = Array.from(this.preparedPeptides.keys()).filter(p => !foundPeptides.has(p));
    }

    /**
     * Prepares the list of originalPeptides for use in the application by
     * cleaving, filtering, equating IL and finally generating a frequence table
     *
     * @param  {string[]} originalPeptides A list of peptides
     * @param  {boolean} il should we equate I and L
     * @param  {boolean} dupes should we filter duplicates?
     * @param  {boolean} missed will we perform advancedMissedCleavageHandling
     * @return {Map.<string, number>} A frequency table of the cleaned up
     *   peptides
     */
    preparePeptides(originalPeptides, il, dupes, missed) {
        let peptides = Resultset.cleavePeptides(originalPeptides, missed);
        peptides = Resultset.filterShortPeptides(peptides);
        peptides = Resultset.equateIL(peptides, il);
        peptides = Resultset.indexPeptides(peptides, dupes);
        return peptides;
    }

    /**
     * Converts the current analysis to the csv format. Each row contains a
     * peptide and its lineage, with each column being a level in the taxonomy
     *
     * @return {string} The analysis result in csv format
     */
    toCSV() {
        let result = "peptide,lca," + MPA.RANKS + "\n";
        for (const peptide of this.processedPeptides) {
            let row = peptide.sequence + ",";
            row += this.dataset.taxonMap.get(peptide.lca).name + ",";
            row += peptide.lineage.map(e => {
                if (e === null) return "";
                return this.dataset.taxonMap.get(e).name;
            });
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
        return this.processedPeptides.map(p => p.count).reduce((a, b) => a + b, 0);
    }

    /**
     * Returns the number of searched for peptides, taking the deduplication
     * setting into account.
     *
     * @return {number} The number of searched for peptides
     */
    getNumberOfSearchedForPeptides() {
        return Array.from(this.preparedPeptides.values()).reduce((a, b) => a + b, 0);
    }

    /**
     * Creates a frequency table for a list of peptides
     *
     * @param  {string[]} peptides A list of peptides
     * @param  {boolean} dupes Filter duplicates
     * @return {Map.<string, number>} A map containing the frequency of
     *   each peptide
     */
    static indexPeptides(peptides, dupes) {
        const peptideMap = new Map();
        for (const peptide of peptides) {
            const count = peptideMap.get(peptide) || 0;
            if (dupes) {
                peptideMap.set(peptide, 1);
            } else {
                peptideMap.set(peptide, count + 1);
            }
        }
        return peptideMap;
    }

    /**
     * Splits all peptides after every K or R if not followed by P if
     * advancedMissedCleavageHandling isn't set
     *
     * @param  {string[]} peptides The list of peptides
     * @param  {boolean} advancedMissedCleavageHandling Should we do
     *   advancedMissedCleavageHandling?
     * @return {string[]} The list of cleaved peptides
     */
    static cleavePeptides(peptides, advancedMissedCleavageHandling) {
        if (!advancedMissedCleavageHandling) {
            return peptides.join("+")
                .replace(/([KR])([^P])/g, "$1+$2")
                .replace(/([KR])([^P+])/g, "$1+$2")
                .split("+");
        }
        return peptides;
    }

    /**
     * Filters out all peptides with a length lower than 5
     *
     * @param  {string[]} peptides A list of peptides
     * @return {string[]} A filtered list of peptides
     */
    static filterShortPeptides(peptides) {
        return peptides.filter(p => p.length >= 5);
    }

    /**
     * Replaces every I with an L if equateIL is set to true
     *
     * @param  {string[]} peptides An array of peptides in upper case
     * @param  {boolean}  equateIL Only makes the replacement if this is true
     * @return {string[]} The peptides where the replacements are made
     */
    static equateIL(peptides, equateIL) {
        if (equateIL) {
            return peptides.map(p => p.replace(/I/g, "L"));
        }
        return peptides;
    }
}

export {Resultset};
