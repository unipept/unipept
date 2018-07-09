import "babel-polyfill"; // for async await webpacker support
import "whatwg-fetch";
// TODO: also include other pollyfills?
import GOTerms from "../fa/goterms.js";
import ECNumbers from "../fa/ecnumbers.js";
import {postJSON, numberToPercent} from "../utils.js";

const BATCH_SIZE = 100;
const PEPT2DATA_URL = "/mpa/pept2data";

/**
 * Worker global conaining processed peptides
 * Keeping this here gives a huge perforamce boost
 * @type {Map<string, any>}
 */
let processedPeptides = new Map();


/**
 * @typedef {Object} MPAPeptide
 * @property {Map}      processed   A map form pepides to information about them
 * @property {string[]} missed      The list of peptides that could not be matched
 * @property {number}   numMatched  Number of peptides that were matched
 * @property {number}   numSearched Number of peptides that were matched
 */


/**
 * @typedef {Object} MPAResult
 * @property {MPAPeptide[]}      processed   A map form pepides to information about them
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
 * @return {Promise<MPAResult>} The result of MPA analysis
 */
export async function process(originalPeptides, config) {
    const preparedPeptides = preparePeptides(originalPeptides, config);
    const peptideList = Array.from(preparedPeptides.keys());
    setProgress(0.1);

    for (let i = 0; i < peptideList.length; i += BATCH_SIZE) {
        const data = JSON.stringify({
            peptides: peptideList.slice(i, i + BATCH_SIZE),
            equate_il: config.il,
            missed: config.missed,
        });
        const lcaResult = await postJSON(PEPT2DATA_URL, data);
        lcaResult.peptides.forEach(p => processedPeptides.set(p.sequence, p));

        setProgress(0.1 + 0.85 * ((i + BATCH_SIZE) / peptideList.length));
    }

    // Prefetch GO term namespaces
    let usedGoTerms = new Set();
    for (let peptide of processedPeptides.values()) {
        Object.keys(peptide.fa.data || [])
            .filter(x => x.startsWith("GO:"))
            .forEach(x => usedGoTerms.add(x));
    }
    await GOTerms.fetch([...usedGoTerms.values()]);

    let numMatched = 0;
    for (const peptide of processedPeptides.values()) {
        peptide.count = preparedPeptides.get(peptide.sequence);
        numMatched += peptide.count;
        makeFaGrouped(peptide);
    }
    setProgress(1);
    return {
        processed: [...processedPeptides.values()].map(({fa, faGrouped, ...y}) => y),
        missed: peptideList.filter(p => !processedPeptides.has(p)),
        numMatched: numMatched,
        numSearched: [...preparedPeptides.values()].reduce((a, b) => a + b, 0),
    };
}

/**
 * Add an faGrouped key to the peptides to find annotaions of a specific type
 * faster
 * @param {PeptideMPAInfo} peptide
 */
function makeFaGrouped(peptide) {
    peptide.faGrouped = {"EC": [], "GO": {}};
    for (const [annotation, count] of Object.entries(peptide.fa.data || {})) {
        const type = annotation.split(":", 1)[0];
        switch (type) {
        case "EC": peptide.faGrouped["EC"].push({code: annotation.substr(3), value: count}); break;
        case "GO": {
            let ns = GOTerms.namespaceOf(annotation);
            if (!(ns in peptide.faGrouped["GO"])) {
                peptide.faGrouped["GO"][ns] = [];
            }
            peptide.faGrouped["GO"][ns].push({code: annotation, value: count});
            break;
        }
        }
    }
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
    return indexPeptides(peptides, config.dupes);
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
 * @param {Iterable<String>} [sequences=null] subset of sequences to take into account,
 *                                    null to consider all
 * @return {Promise<{data:Object<String,MPAFAResult[]>,trust:Object<String,object>}>} Go terms summary
 */
export async function summarizeGo(percent = 50, sequences = null) {
    // Find used go term and fetch data about them
    let usedGoTerms = new Set();
    for (let peptide of processedPeptides.values()) {
        Object.keys(peptide.fa.data || [])
            .filter(x => x.startsWith("GO:"))
            .forEach(x => usedGoTerms.add(x));
    }
    await GOTerms.fetch([...usedGoTerms.values()]);

    // Build summary per namespace
    let res = {};
    let trust = {};
    const countExtractor = pept => pept.fa.counts["GO"] || 0;
    const trustExtractor = pept => countExtractor(pept) / pept.fa.counts["all"];
    for (let namespace of GOTerms.NAMESPACES) {
        const dataExtractor = pept => pept.faGrouped.GO[namespace] || [];
        const {data, trust: curStats} = summarizeFa(dataExtractor, countExtractor, trustExtractor, percent, sequences);
        trust[namespace] = curStats;
        res[namespace] = data;
    }

    return {data: res, trust: trust};
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
 * @return {Promise<{data:MPAFAResult[],trust:object}>} ECNumbers summary
 */
export async function summarizeEc(percent = 50, sequences = null) {
    const dataExtractor = pept => pept.faGrouped.EC;
    const countExtractor = pept => pept.fa.counts["EC"] || 0;
    const trustExtractor = pept => countExtractor(pept) / pept.fa.counts["all"];

    return summarizeFa(dataExtractor, countExtractor, trustExtractor, percent, sequences);
}

/**
 * Create a mapping of functional analysis codes to a weight by aggregating
 * the counts of all peptides that have functional analysis tags.
 *
 * @param {function(MPAPeptide): Iterable<{code, value}>} extract
 *            function extracting the FAInfo form a peptide
 * @param {function(MPAPeptide): number} countExtractor
 *            function extracting the the number of annotated (full)peptides
 *            form a peptide
 * @param {function(MPAPeptide): number} trustExtractor
 *            function calcualting a trust level in [0,1] for the annotaions
 *            of a peptide.
 * @param {number} cutoff  data with strictly lower weight is ignored
 *                         value should be given as percentage in [0,100]
 * @param {Iterable.<string>} [sequences=null] subset of sequences to take into account,
 *                                    null to consider all
 * @return {{data:MPAFAResult[],trust:FATrustInfo}} an array of MPAFAResult to be stored
 * @todo  remove the cutoff
 */
function summarizeFa(extract, countExtractor, trustExtractor, cutoff = 50, sequences = null) {
    let iteratableOfSequences = sequences || processedPeptides.keys();

    const map = new Map();
    const seqMap = new Map();
    const fraction = cutoff / 100;
    let sumWeight = 0;
    let sumCount = 0;
    let sumTrust = 0;
    let numAnnotated = 0;

    for (let sequence of iteratableOfSequences) {
        const pept = processedPeptides.get(sequence);
        const totalNumAnnotations = countExtractor(pept);
        const trust = trustExtractor(pept) || 0;
        sumCount += pept.count;

        if (totalNumAnnotations > 0) {
            let atLeastOne = false;
            for (const {code, value} of extract(pept)) {
                const weight = value / totalNumAnnotations;
                if (weight < fraction) continue; // skip if insignificant weight TODO: remove
                atLeastOne = true;
                const count = map.get(code) || [0, 0, 0, 0, 0];
                const faSeqences = seqMap.get(code) || Object.create(null);
                faSeqences[sequence] = pept.count;
                seqMap.set(code, faSeqences);
                const scaledWeight = weight * pept.count;
                map.set(code, [
                    count[0] + scaledWeight,
                    count[1] + value,
                    count[2] + value * pept.count,
                    count[3] + pept.count,
                    count[4] + trust * pept.count,
                ]);
                sumWeight += scaledWeight;
            }

            if (atLeastOne) {
                sumTrust += trust * pept.count;
                numAnnotated += pept.count;
            }
        }
    }


    return {
        trust: {
            trustCount: sumTrust,
            annotatedCount: numAnnotated,
            totalCount: sumCount,
        },
        data: Array.from(map).map(x => ({
            code: x[0],
            weightedValue: x[1][0],
            absoluteCountFiltered: x[1][1],
            absoluteCount: x[1][2],
            numberOfPepts: x[1][3],
            fractionOfPepts: x[1][3] / sumCount,
            trust: x[1][4] / x[1][3],
            value: x[1][3],
            evidence: x[1][0] / sumWeight,
            sequences: seqMap.get(x[0]),
        })),
    };
}

/**
 * @return {object} GOTerms.goData to perform `GOTerms.ingestData`
 */
export function getGoData() {
    return Array.from(GOTerms.goData.entries());
}

/**
 * Copy of ranks from MPA ranks to not have to include MPA in the worker
 * @type {string[]}
 */
const RANKS = ["superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class", "subclass", "infraclass", "superorder", "order", "suborder", "infraorder", "parvorder", "superfamily", "family", "subfamily", "tribe", "subtribe", "genus", "subgenus", "species group", "species subgroup", "species", "subspecies", "varietas", "forma"];

/**
 * Converts the current analysis to the csv format. Each row contains a
 * peptide and its lineage, with each column being a level in the taxonomy
 *
 * @param {Map<number,TaxonInfo>} taxonMap map of taxon names
 * @return {string} The analysis result in csv format
 */
export function getCSV(taxonMap) {
    let result = "peptide,lca," +
    RANKS.join(",") + "," +
    "EC," +
    GOTerms.NAMESPACES.map(ns => `GO (${ns})`).join(",") +
    "\n";
    for (const peptide of processedPeptides.values()) {
        let row = peptide.sequence + ",";

        row += taxonMap.get(peptide.lca).name + ",";
        row += peptide.lineage.map(e => {
            if (e === null) return "";
            return taxonMap.get(e).name;
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
 * Returns a list of sequences that have the specified FA term
 * @param {String} faName The name of the FA term (GO:000112, EC:1.5.4.1)
 * @param {String[]} sequences List of sequences to limit to
 * @return {{sequence, hits, type, annotatedCount,allCount,relativeCount, count}[]}
 *    A list of objects representing the matchesFunctionalAnnotations
 */
export function getPeptidesByFA(faName, sequences = null) {
    const type = faName.split(":")[0];
    let iteratableOfSequences = sequences || processedPeptides.keys();

    const result = [];

    for (const curSeq of iteratableOfSequences) {
        const pept = processedPeptides.get(curSeq);
        if (faName in pept.fa.data) {
            result.push({
                sequence: pept.sequence,
                type: type,
                hits: pept.fa.data[faName],
                annotatedCount: pept.fa.counts[type],
                allCount: pept.fa.counts["all"],
                relativeCount: pept.fa.data[faName] / pept.fa.counts[type],
                count: pept.count,
            });
        }
    }

    return result;
}

/**
 * Send out a message to the calling procces that that the progress
 * has changed
 * @param {number} value progrress in [0,1]
 */
function setProgress(value) {
    self.postMessage({type: "progress", value: value});
}

/**
 * Reset the worker for an other dataset
 */
export function clean() {
    processedPeptides = new Map();
}
