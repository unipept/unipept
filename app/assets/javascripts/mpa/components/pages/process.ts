import { ProcessedPeptideContainer } from "unipept-web-components/src/logic/data-management/ProcessedPeptideContainer";
import { postJSON } from "unipept-web-components/src/logic/utils";
import { PeptideData } from "unipept-web-components/src/logic/api/pept2data/Response";
import MPAConfig from "unipept-web-components/src/logic/data-management/MPAConfig";
import { consoleWarn } from 'vuetify/src/util/console';

const BATCH_SIZE = 100;
const API_ENDPOINT = "/mpa/pept2data";

export default async function process(peptides: string[], config: MPAConfig, baseUrl: string, setProgress: (number) => void) : Promise<ProcessedPeptideContainer> {
    var preparedPeptides = preparePeptides(peptides, config);
    const peptideList = Array.from(preparedPeptides.keys());

    var numSearched = [...preparedPeptides.values()].reduce((a, b) => a + b, 0);
    var numMatched = 0;

    var response = new Map<string, PeptideData>();

    setProgress(0.1);
    console.log(peptideList);

    for (let i = 0; i < peptideList.length; i += BATCH_SIZE) {
        const data = JSON.stringify({
            peptides: peptideList.slice(i, i + BATCH_SIZE),
            equate_il: config.il,
            missed: config.missed
        });

        console.log("Posting JSON");
        const res = await postJSON(baseUrl + API_ENDPOINT, data);

        res.peptides.forEach(p => {
            response.set(p.sequence, { lca: p.lca, lineage: p.lineage, fa: p.fa });
            numMatched += preparedPeptides.get(p.sequence);
        })

        setProgress(0.1 + 0.85 * ((i + BATCH_SIZE) / peptideList.length));
    }

    var missedPeptides = peptideList.filter(p => !response.has(p))

    console.log("Setting progress to 1");
    setProgress(1)

    return {
        countTable: preparedPeptides,
        response,
        missed: missedPeptides,
        numMatched,
        numSearched
    };
}

/**
 * Prepares the list of originalPeptides for use in the application by
 * cleaving, filtering, equating IL and finally generating a frequency table
 */
function preparePeptides(originalPeptides : string[], config: MPAConfig) {
    let peptides = cleavePeptides(originalPeptides, config.missed);
    peptides = filterShortPeptides(peptides);
    peptides = equateIL(peptides, config.il);
    return indexPeptides(peptides, config.dupes);
}

/**
 * Split all peptides after every K or R if not followed by P if
 * advancedMissedCleavageHandling isn't set
 */
function cleavePeptides(peptides: string[], advancedMissedCleavageHandling: boolean) {
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
 */
function filterShortPeptides(peptides: string[]) {
    return peptides.filter(p => p.length >= 5);
}

/**
 * Replaces every I with an L if equateIL is set to true
 */
function equateIL(peptides: string[], equateIL: boolean) {
    if (equateIL) {
        return peptides.map(p => p.replace(/I/g, "L"));
    }
    return peptides;
}

/**
 * Creates a frequency table for a list of peptides
 */
function indexPeptides(peptides: string[], dupes: boolean) {
    const peptideMap = new Map<string, number>();
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
