import "babel-polyfill";
import GOTerms from "../components/goterms.js";
import ECNumbers from "../components/ecnumbers.js";
import {postJSON} from "../utils.js";

// block for `time` ms, then return the number of loops we could run in that time:
/**
 *
 * @param {*} peptides
 * @param {*} il
 * @param {*} missed
 * @param {*} preparedPeptides
 */
export async function getter(peptideList, il, missed, preparedPeptides) {
    const BATCH_SIZE = 100,
        PEPT2LCA_URL = "/mpa/pept2lca",
        PEPT2FA_URL = "/mpa/pept2fa";

    setProgress(1/peptideList.length);


    const processedPeptides = new Map();
    for (let i = 0; i < peptideList.length; i += BATCH_SIZE) {
        const data = JSON.stringify({
            peptides: peptideList.slice(i, i + BATCH_SIZE),
            equate_il: il,
            missed: missed,
        });
        const lcaQuery = postJSON(PEPT2LCA_URL, data);
        const faQuery = postJSON(PEPT2FA_URL, data);

        await Promise.all([lcaQuery, faQuery]).then(([lcaResult, faResult]) => {
            for (let pept of lcaResult.peptides) {
                let faData = faResult.peptides[pept.sequence];
                pept.fa = faData;
            }
            lcaResult.peptides.forEach(p => processedPeptides.set(p.sequence, p));
        });

        setProgress((i + BATCH_SIZE) / peptideList.length);
    }

    for (const peptide of processedPeptides.values()) {
        peptide.count = preparedPeptides.get(peptide.sequence);
    }

    return processedPeptides;
}


/**
     * Fill `this.go` with a Map<string,GoInfo[]> per namespace. The values of the
     * maps have an additional `value` field that indicated the weight of that
     * GO number.
     * @param {[Peptides]} processedPeptides
     * @param {number} [percent=50] ignore data weighing less (to be removed)
     * @param {string[]} [sequences=null] subset of sequences to take into account,
     *                                    null to consider all
     */
export async function summarizeGo(processedPeptides, percent = 50, sequences=null) {
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
        res[namespace] = summarizeFa(processedPeptides, dataExtractor, countExtractor, percent, sequences);
    }

    return new GOTerms({data: res}, false);
}

/**
     * Fill `this.ec` with a Map<string,EcInfo[]>. The values of the map
     * have an additional `value` field that indicated the weight of that
     * EC number.
     * @param {[Peptides]} processedPeptides
     * @param {number} [percent=50] ignore data weighing less (to be removed)
     * @param {string[]} [sequences=null] subset of sequences to take into account,
     *                                    null to consider all
     */
export async function summarizeEc(processedPeptides, percent = 50, sequences=null) {
    // Filter FA' staring with EC (+ remove "EC:")
    const dataExtractor = pept =>
        Object.entries(pept.fa.data)
            .filter(([a, b]) => a.startsWith("EC"))
            .map(([a, b]) => ({code: a.substr(3), value: b})) || [];

    const countExtractor = pept => pept.fa.counts.EC || 0;

    const result = summarizeFa(processedPeptides, dataExtractor, countExtractor, percent, sequences);
    let ec = new ECNumbers({data: result}, false);
    await ec.ensureData();
    return ec;
}

/**
     * Create a mapping of functional analysis codes to a weight by aggregating
     * the counts of all peptides that have functional analysis tags.
     *
     * @example this.summarizeFa(pept => pept.fa.ec || [])
     * @param {[Peptides]} processedPeptides
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
function summarizeFa(processedPeptides, extract, countExtractor, cutoff = 50, sequences=null) {
    let iteratableOfSequences = sequences || processedPeptides.keys();
    const map = new Map();
    const fraction = cutoff / 100;
    let numAnnotations = 0;
    for (let sequence of iteratableOfSequences) {
        const pept = processedPeptides.get(sequence);
        const divisor = countExtractor(pept);
        if (divisor !== 0) {
            const counts = extract(pept);
            for (const {code, value} of counts) {
                const weight = value / divisor;
                if (weight < fraction) continue; // skip if insignificant TODO: remove
                const count = map.get(code) || [0, 0, 0, 0];
                const scaledWeight = weight * (pept.count);
                map.set(code, [
                    count[0] + scaledWeight,
                    count[1] + value,
                    count[2] + value * pept.count,
                    count[3] + pept.count,
                ]);
                numAnnotations += scaledWeight;
            }
        }
    }

    return Array.from(map).map(x => ({
        code: x[0],
        weightedValue: x[1][0],
        absoluteCountFiltered: x[1][1],
        absoluteCount: x[1][2],
        numberOfPepts: x[1][3],
        value: x[1][0] / numAnnotations,
    }));
}

/**
 * dsd
 */
export function getGoData() {
    return GOTerms.goData;
}

export function getEcNames() {
    return ECNumbers.ecNames;
}

let progress = 0;

/**
 * dsdd
 * @param {*} value
 */
function setProgress(value) {
    progress = value;
}

export function getProgress() {
    return progress;
}

