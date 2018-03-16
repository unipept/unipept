import {MPA} from "./index.js";
import {Dataset} from "./dataset.js";
import GOTerms from "../components/goterms.js";
import ECNumbers from "../components/ecnumbers.js";

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
        this.processedPeptides = new Map();
        this.missedPeptides = [];
        this.ec = null;
        this.go = null;
        this.progress = 0;
    }

    /**
     * Processes the list of peptides set in the dataset and returns a
     * taxonomic tree.
     */
    async process() {
        const peptideList = Array.from(this.preparedPeptides.keys());
        this.processedPeptides = new Map();
        this.setProgress(1/peptideList.length);
        for (let i = 0; i < peptideList.length; i += Dataset.BATCH_SIZE) {
            const data = JSON.stringify({
                peptides: peptideList.slice(i, i + Dataset.BATCH_SIZE),
                equate_il: this.il,
                missed: this.missed,
            });
            const lcaQuery = Dataset.postJSON(Dataset.PEPT2LCA_URL, data);
            const faQuery = Dataset.postJSON(Dataset.PEPT2FA_URL, data);

            await Promise.all([lcaQuery, faQuery]).then(([lcaResult, faResult]) => {
                for (let pept of lcaResult.peptides) {
                    let faData = faResult.peptides[pept.sequence];
                    pept.fa = faData;
                }
                lcaResult.peptides.forEach(p => this.processedPeptides.set(p.sequence, p));
                this.setProgress((i + Dataset.BATCH_SIZE) / peptideList.length);
            });
        }
        for (const peptide of this.processedPeptides.values()) {
            peptide.count = this.preparedPeptides.get(peptide.sequence);
        }
        this.setMissedPeptides();
        await Promise.all([this.summarizeGo(), this.summarizeEc()]);
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
        this.missedPeptides = [...this.preparedPeptides.keys()].filter(p => !this.processedPeptides.has(p));
    }

    /**
     * Prepares the list of originalPeptides for use in the application by
     * cleaving, filtering, equating IL and finally generating a frequency table
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
        for (const peptide of this.processedPeptides.values()) {
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
        return [...this.processedPeptides.values()]
            .reduce((a, b) => a.count + b.count, 0);
    }

    /**
     * Returns the number of searched for peptides, taking the deduplication
     * setting into account.
     *
     * @return {number} The number of searched for peptides
     */
    getNumberOfSearchedForPeptides() {
        return [...this.preparedPeptides.values()].reduce((a, b) => a + b, 0);
    }

    /**
     * Returns a list of sequences that have the specified FA term
     * @param {String} faName The name of the FA term (GO:000112, EC:1.5.4.1)
     * @return {[{sequence, totalCount, relativeCount}]} A list of objects representing
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
     * maps have an additional `value` field that indicated the weight of that
     * GO number.
     * @param {number} [percent=50] ignore data weighing less (to be removed)
     * @param {string[]} [sequences=null] subset of sequences to take into account,
     *                                    null to consider all
     */
    async summarizeGo(percent = 50, sequences=null) {
        // Find used go term and fetch data about them
        let usedGoTerms = new Set();
        for (let peptide of this.processedPeptides.values()) {
            Object.keys(peptide.fa.data)
                .filter(x => x.startsWith("GO:"))
                .forEach(x => usedGoTerms.add(x));
        }
        await GOTerms.addMissingNames([...usedGoTerms.values()]);

        // Build summary
        let res = {};
        const countExtractor = pept => pept.fa.counts["GO"] || 0;
        for (let namespace of GOTerms.NAMESPACES) {
            const dataExtractor = pept => Object.entries(pept.fa.data)
                .filter(([term, count]) => term.startsWith("GO") && GOTerms.namespaceOf(term) == namespace)
                .map(([term, count]) => ({code: term, value: count})) || [];
            res[namespace] = this.summarizeFa(dataExtractor, countExtractor, percent, sequences);
        }
        this.go = new GOTerms({data: res}, false);
        // await this.go.ensureData(); we already fetched everything
    }

    /**
     * Fill `this.ec` with a Map<string,EcInfo[]>. The values of the map
     * have an additional `value` field that indicated the weight of that
     * EC number.
     * @param {number} [percent=50] ignore data weighing less (to be removed)
     * @param {string[]} [sequences=null] subset of sequences to take into account,
     *                                    null to consider all
     */
    async summarizeEc(percent = 50, sequences=null) {
        const dataExtractor = pept => Object.entries(pept.fa.data).filter(([a, b]) => a.startsWith("EC")).map(([a, b]) => ({code: a.replace("EC:", ""), value: b})) || [];
        const countExtractor = pept => pept.fa.counts["EC"] || 0;
        const result = this.summarizeFa(dataExtractor, countExtractor, percent, sequences);
        this.ec = new ECNumbers({data: result}, false);
        await this.ec.ensureData();
    }

    /**
     * Create a mapping of functional analysis codes to a weight by aggregating
     * the counts of all peptides that have functional analysis tags.
     *
     * @example this.summarizeFa(pept => pept.fa.ec || [])
     * @param {function(pept:Peptide): {code, value}} extract
     *            function extracting the FAInfo form a peptide
     * @param {function(pept:Peptide): int} countExtractor
     *            function extracting the the number of annotated (full)peptides
     *            form a peptide
     * @param {number} cutoff  data with strictly lower weight is ignored
     *                         value should be given as percentage in [0,100]
     * @return {Map<string,number>} map  map to store the results in
     * @param {Iterable.<string>} [sequences=null] subset of sequences to take into account,
     *                                    null to consider all
     * @todo  remove the cutoff
     */
    summarizeFa(extract, countExtractor, cutoff = 50, sequences=null) {
        let iteratableOfSequences = sequences || this.processedPeptides.keys();
        const map = new Map();
        const fraction = cutoff / 100;
        let numAnnotations = 0;
        for (let sequence of iteratableOfSequences) {
            const pept = this.processedPeptides.get(sequence);
            const divisor = countExtractor(pept);
            if (divisor !== 0) {
                const counts = extract(pept);
                for (const {code, value} of counts) {
                    const weight = value / divisor;
                    if (weight < fraction) continue; // skip if insignificant TODO: remove
                    const count = map.get(code) || 0;
                    const scaledWeight = weight * (pept.count);
                    map.set(code, count + scaledWeight);
                    numAnnotations += scaledWeight;
                }
            }
        }

        return Array.from(map).map(x => ({code: x[0], value: x[1] / numAnnotations}));
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
