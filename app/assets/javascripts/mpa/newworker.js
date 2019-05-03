import "babel-polyfill"; // for async await webpacker support
import "whatwg-fetch";
// TODO: also include other pollyfills?
import {postJSON, numberToPercent} from "../utils.js";

const BATCH_SIZE = 100;
const PEPT2DATA_URL = "/mpa/pept2data";

const goTermsCache = new Map();

export async function process(originalPeptides, config, goRequester) {
    const preparedPeptides = preparePeptides(originalPeptides, config);
    const peptideList = Array.from(preparedPeptides.keys());
    setProgress(0.1);

    let processedPeptides = new Map();
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

    let numMatched = 0;
    for (const peptide of processedPeptides.values()) {
        peptide.count = preparedPeptides.get(peptide.sequence);
        numMatched += peptide.count;
        // TODO fix grouped!
        //makeFaGrouped(peptide);
    }
    setProgress(1);
    return {
        processed: [...processedPeptides.values()].map(({fa, faGrouped, ...y}) => y),
        missed: peptideList.filter(p => !processedPeptides.has(p)),
        numMatched: numMatched,
        numSearched: [...preparedPeptides.values()].reduce((a, b) => a + b, 0)
    };
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
