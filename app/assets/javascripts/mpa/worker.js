import "babel-polyfill"; // for async await webpacker support
// TODO: also include other pollyfills?
import GOTerms from "../components/goterms.js";
import ECNumbers from "../components/ecnumbers.js";
import {postJSON} from "../utils.js";

const BATCH_SIZE = 100;
const PEPT2DATA_URL = "/mpa/pept2data";

/* Worker global conaining processed peptides
 * Keeping this here gives a huge perforamce boost
 */
let processedPeptides = new Map();


/**
 * @typedef {Object} MPAResult
 * @property {Map}      processed   A map form pepides to information about them
 * @property {string[]} missed      The list of peptides that could not be matched
 * @property {number}   numMatched  Number of peptides that were matched
 * @property {number}   numSearched Number of peptides that were matched
 */

/**
 * @typedef {Object} MPAConfig
 * @property  {boolean} il     should we equate I and L
 * @property  {boolean} dupes  should we filter duplicates?
 * @property  {boolean} missed will we perform advancedMissedCleavageHandling
 */


/**
 * @typedef {Object} MPAFAResult
 * @property  {number} weightedValue
 *  The sum of the relative weights of the GOTerm in each sequence it occurs in
 * @property  {number} absoluteCount
 *   The number of occurences of this annotation in a protein that was matched by a
 *   sequence taking dupes into account (only if il=false)
 * @property  {number} absoluteCountFiltered
 *   `absoluteCount` not taking dupes into account
 * @property  {number} numberOfPepts
 *   Number of peptides this annotiation occurs at least once in (taking dupes into account)
 * @property  {number} value
 *   weightedValue / sumWeightedValue
 */

/**
 * Fetches inforamtaion of the list of
 *
 * @param  {string[]} originalPeptides The list of peptides to procces
 * @param {MPAConfig} config The configuration of the search
 * @return {MPAResult} The result of MPA analysis
 */
export async function process(originalPeptides, config) {
    const preparedPeptides = preparePeptides(originalPeptides, config);
    const peptideList = Array.from(preparedPeptides.keys());


    for (let i = 0; i < peptideList.length; i += BATCH_SIZE) {
        const data = JSON.stringify({
            peptides: peptideList.slice(i, i + BATCH_SIZE),
            equate_il: config.il,
            missed: config.missed,
        });
        const lcaResult = await postJSON(PEPT2DATA_URL, data);
        lcaResult.peptides.forEach(p => processedPeptides.set(p.sequence, p));

        setProgress((i + BATCH_SIZE) / peptideList.length);
    }

    let numMatched = 0;
    for (const peptide of processedPeptides.values()) {
        peptide.count = preparedPeptides.get(peptide.sequence);
        numMatched += peptide.count;
    }

    return {
        processed: processedPeptides,
        missed: peptideList.filter(p => !processedPeptides.has(p)),
        numMatched: numMatched,
        numSearched: [...preparedPeptides.values()].reduce((a, b) => a + b, 0),
    };
}


/**
 * Prepares the list of originalPeptides for use in the application by
 * cleaving, filtering, equating IL and finally generating a frequency table
 *
 * @param  {string[]} originalPeptides A list of peptides
 * @param {MPAConfig} config The configuration of the search
 * @return {Map.<string, number>} A frequency table of the cleaned up peptides
 */
function preparePeptides(originalPeptides, config) {
    let peptides = cleavePeptides(originalPeptides, config.missed);
    peptides = filterShortPeptides(peptides);
    peptides = equateIL(peptides, config.il);
    peptides = indexPeptides(peptides, config.dupes);
    return peptides;
}


/**
 * Creates a frequency table for a list of peptides
 *
 * @param  {string[]} peptides A list of peptides
 * @param  {boolean} dupes Filter duplicates
 * @return {Map.<string, number>} A map containing the frequency of each peptide
 * @access private
 */
function indexPeptides(peptides, dupes) {
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
 *      advancedMissedCleavageHandling?
 * @return {string[]} The list of cleaved peptides
 * @access private
 */
function cleavePeptides(peptides, advancedMissedCleavageHandling) {
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
 * @access private
 */
function filterShortPeptides(peptides) {
    return peptides.filter(p => p.length >= 5);
}

/**
 * Replaces every I with an L if equateIL is set to true
 *
 * @param  {string[]} peptides An array of peptides in upper case
 * @param  {boolean}  equateIL Only makes the replacement if this is true
 * @return {string[]} The peptides where the replacements are made
 * @access private
 */
function equateIL(peptides, equateIL) {
    if (equateIL) {
        return peptides.map(p => p.replace(/I/g, "L"));
    }
    return peptides;
}


/**
 * Creates a `GOTerms` summary of the go terms avalible in the dataset.
 * Optinally limited to a list of sequences and/or a tresshold of acceptance
 *
 * After using this function you should synchronise the contents of the GOTerms
 * data as static inforamtin about these terms is not shared over threads.
 * (see getGoData).
 *
 * @param {number} [percent=50] ignore data weighing less (to be removed)
 * @param {string[]} [sequences=null] subset of sequences to take into account,
 *                                    null to consider all
 * @return {GOTerms} GoTerms summary
 */
export async function summarizeGo(percent = 50, sequences=null) {
    // Find used go term and fetch data about them
    let usedGoTerms = new Set();
    for (let peptide of processedPeptides.values()) {
        Object.keys(peptide.fa.data)
            .filter(x => x.startsWith("GO:"))
            .forEach(x => usedGoTerms.add(x));
    }
    await GOTerms.addMissingNames([...usedGoTerms.values()]);

    // Build summary per namespace
    let res = {};
    const countExtractor = pept => pept.fa.counts["GO"] || 0;
    for (let namespace of GOTerms.NAMESPACES) {
        const dataExtractor = pept => Object.entries(pept.fa.data)
            .filter(([term, count]) => term.startsWith("GO") && GOTerms.namespaceOf(term) == namespace)
            .map(([term, count]) => ({code: term, value: count})) || [];
        res[namespace] = summarizeFa(dataExtractor, countExtractor, percent, sequences);
    }

    return new GOTerms({data: res}, false);
}

/**
 * Creates a `ECNumbers` summary of the go terms avalible in the dataset.
 * Optinally limited to a list of sequences and/or a tresshold of acceptance
 *
 * After using this function you should synchronise the contents of the ECNumbers
 * data as static inforamtin about these terms is not shared over threads.
 * (see getEcNames).
 *
 * @param {number} [percent=50] ignore data weighing less (to be removed)
 * @param {string[]} [sequences=null] subset of sequences to take into account,
 *                                    null to consider all
 * @return {ECNumbers} ECNumbers summary
 */
export async function summarizeEc(percent = 50, sequences=null) {
    // Filter FA' staring with EC (+ remove "EC:")
    const dataExtractor = pept =>
        Object.entries(pept.fa.data)
            .filter(([a, b]) => a.startsWith("EC"))
            .map(([a, b]) => ({code: a.substr(3), value: b})) || [];

    const countExtractor = pept => pept.fa.counts.EC || 0;

    const result = summarizeFa(dataExtractor, countExtractor, percent, sequences);
    let ec = new ECNumbers({data: result}, false);
    await ec.ensureData();
    return ec;
}

/**
 * Create a mapping of functional analysis codes to a weight by aggregating
 * the counts of all peptides that have functional analysis tags.
 *
 * @param {function(pept:Peptide): {code, value}} extract
 *            function extracting the FAInfo form a peptide
 * @param {function(pept:Peptide): int} countExtractor
 *            function extracting the the number of annotated (full)peptides
 *            form a peptide
 * @param {number} cutoff  data with strictly lower weight is ignored
 *                         value should be given as percentage in [0,100]
 * @param {Iterable.<string>} [sequences=null] subset of sequences to take into account,
 *                                    null to consider all
 * @return {MPAFAResult[]} an array of MPAFAResult to be stored
 * @todo  remove the cutoff
 */
function summarizeFa(extract, countExtractor, cutoff = 50, sequences=null) {
    let iteratableOfSequences = sequences || processedPeptides.keys();

    const map = new Map();
    const fraction = cutoff / 100;
    let sumWeight = 0;

    for (let sequence of iteratableOfSequences) {
        const pept = processedPeptides.get(sequence);
        const totalNumAnnotations = countExtractor(pept);

        if (totalNumAnnotations > 0) {
            for (const {code, value} of extract(pept)) {
                const weight = value / totalNumAnnotations;
                if (weight < fraction) continue; // skip if insignificant weight TODO: remove

                const count = map.get(code) || [0, 0, 0, 0];
                const scaledWeight = weight * (pept.count);
                map.set(code, [
                    count[0] + scaledWeight,
                    count[1] + value,
                    count[2] + value * pept.count,
                    count[3] + pept.count,
                ]);
                sumWeight += scaledWeight;
            }
        }
    }

    return Array.from(map).map(x => ({
        code: x[0],
        weightedValue: x[1][0],
        absoluteCountFiltered: x[1][1],
        absoluteCount: x[1][2],
        numberOfPepts: x[1][3],
        value: x[1][0] / sumWeight,
    }));
}

/**
 * @return {object} GOTerms.goData to perform `GOTerms.ingestData`
 */
export function getGoData() {
    return GOTerms.goData;
}

/**
 * @return {object} ECNumbers.ecNames to perform `ECNumbers.ingestNames`
 */
export function getEcNames() {
    return ECNumbers.ecNames;
}


/**
 * Send out a message to the calling procces that that the progress
 * has changed
 * @param {number} value progrress in [0,1]
 */
function setProgress(value) {
    self.postMessage({type: "progress", value: value});
}
