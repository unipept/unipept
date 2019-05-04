import "babel-polyfill"; // for async await webpacker support
import "whatwg-fetch";
// TODO: also include other pollyfills?
import {postJSON, numberToPercent} from "../utils.js";

const BATCH_SIZE = 100;
const PEPT2DATA_URL = "/mpa/pept2data";

const NAMESPACES = ["biological process", "cellular component", "molecular function"];

/**
 * @type {Map<string, GoTermCache>}
 */
let goTermsCache = new Map();
let processedPeptides = new Map();
/**
 * @type {MPAPeptide}
 */
let result;

 /**
  * TODO Convert to TypeScript
  * @typedef {Object} MPAPeptide
  * @property {any}      processed   A map from peptides to information about them
  * @property {string[]} missed      The list of peptides that could not be matched
  * @property {number}   numMatched  Number of peptides that were matched
  * @property {number}   numSearched Number of peptides that were matched
  */

 /**
  * TODO convert to TypeScript
  * 
  * @typedef {Object} MPAFAResult
  * @property  {number} weightedValue
  *  The sum of the relative weights of the GOTerm in each sequence it occurs in
  * @property  {number} absoluteCount
  *   The number of occurrences of this annotation in a protein that was matched by a
  *   sequence taking dupes into account (only if il=false)
  * @property  {number} absoluteCountFiltered
  *   `absoluteCount` not taking dupes into account
  * @property  {number} numberOfPepts
  *   Number of peptides this annotation occurs at least once in (taking dupes into account)
  * @property  {number} value
  *   weightedValue / sumWeightedValue
  * @property {string} code
  * @property {string} name
  * @property {string} namespace
  * @property {number} fractionOfPepts
  */ 

  /**
   * TODO convert to TypeScript
   * 
   * @typedef {Object} GoTermCache
   * @property {string} name 
   * @property {string} namespace 
   * @property {string} code 
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

    // Prefetch the required GO-terms.
    let usedGoTerms = new Set();
    for (let peptide of processedPeptides.values()) {
        Object.keys(peptide.fa.data || [])
            .filter(x => x.startsWith("GO:"))
            .forEach(x => usedGoTerms.add(x));
    }
    await cache(Array.from(usedGoTerms.values()));

    let numMatched = 0;
    for (const peptide of processedPeptides.values()) {
        peptide.count = preparedPeptides.get(peptide.sequence);
        numMatched += peptide.count;
        makeFaGrouped(peptide);
    }

    setProgress(1);

    result = {
        processed: [...processedPeptides.values()].map(({fa, faGrouped, ...y}) => y),
        missed: peptideList.filter(p => !processedPeptides.has(p)),
        numMatched: numMatched,
        numSearched: [...preparedPeptides.values()].reduce((a, b) => a + b, 0)
    };

    return result;
}

export function getResult() {
    return result;
}

/**
 * Cache some GO-terms inside this web worker. This allows a much faster retrieval of these items later on.
 * 
 * @param {string[]} goTerms 
 */
async function cache(goTerms) {
    // Check which goTerms have already been downloaded
    const todo = goTerms.filter(c => !goTermsCache.has(c));
    if (todo.length > 0) {
        for (let i = 0; i < todo.length; i += BATCH_SIZE) {
            const res = await postJSON("/private_api/goterms", JSON.stringify({
                goterms: todo.slice(i, i + BATCH_SIZE),
            }));
            addToCache(res);
        }
    }
}

async function addToCache(newTerms, namespace = null) {
    newTerms.forEach(go => {
        if (!goTermsCache.has(go.code) && (namespace != null || go.namespace) && go.name) {
            goTermsCache.set(go.code, {
                name: go.name,
                namespace: go.namespace || namespace,
                code: go.code,
            });
        }
    });
}

/**
 * Add an faGrouped key to the peptides to find annotations of a specific type
 * faster
 * 
 * @param {PeptideMPAInfo} peptide
 */
function makeFaGrouped(peptide) {
    peptide.faGrouped = {"EC": [], "GO": {}};
    // @ts-ignore
    for (const [annotation, count] of Object.entries(peptide.fa.data || {})) {
        const type = annotation.split(":", 1)[0];
        switch (type) {
            case "EC": peptide.faGrouped["EC"].push({code: annotation.substr(3), value: count}); break;
            case "GO": {
                let ns = "Unknown";
                if (goTermsCache.has(annotation)) {
                    ns = goTermsCache.get(annotation)["namespace"];
                }
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
 * 
 * @param {number} percent 
 * @param {Iterable<String>} sequences 
 * @return {Promise<{data, trust}>}
 */
export async function summarizeGo(percent = 50, sequences = null) {
    let goData = Array.from(goTermsCache.entries());

    let usedGoTerms = new Set();
    for (let peptide of processedPeptides.values()) {
        Object.keys(peptide.fa.data || [])
            .filter(x => x.startsWith("GO:"))
            .forEach(x => usedGoTerms.add(x));
    }

    await cache(Array.from(usedGoTerms.values()));

    let res = {};
    let trust = {};
    const countExtractor = pept => pept.fa.counts["GO"] || 0;
    const trustExtractor = pept => countExtractor(pept) / pept.fa.counts["all"];
    for (let namespace of NAMESPACES) {
        const dataExtractor = pept => pept.faGrouped.GO[namespace] || [];
        const {data, trust: curStats} = summarizeFa(dataExtractor, countExtractor, trustExtractor, percent, sequences);
        trust[namespace] = curStats;
        res[namespace] = data;
    }

    // Sort all terms per namespace by popularity
    for (let namespace of NAMESPACES) {
        res[namespace] = res[namespace].sort((a, b) => b.numberOfPepts - a.numberOfPepts);
    }

    return {data: res, trust: trust}
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
    let iterableOfSequences = sequences || processedPeptides.keys();

    const map = new Map();
    const seqMap = new Map();
    const fraction = cutoff / 100;
    let sumWeight = 0;
    let sumCount = 0;
    let sumTrust = 0;
    let numAnnotated = 0;

    for (let sequence of iterableOfSequences) {
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
            name: goTermsCache.get(x[0]).name,
            namespace: goTermsCache.get(x[0]).namespace,
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
 * Returns a list of sequences that have the specified FA term
 * 
 * @param {String} faName The name of the FA term (GO:000112, EC:1.5.4.1)
 * @param {String[]} sequences List of sequences to limit to
 * @return {{sequence, hits, type, annotatedCount,allCount,relativeCount, count}[]} A list of objects representing the 
 * matchesFunctionalAnnotations
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
 * Send out a message to the calling process that that the progress
 * has changed
 * @param {number} value progress in [0,1]
 */
function setProgress(value) {
    // @ts-ignore
    self.postMessage({type: "progress", value: value});
}
