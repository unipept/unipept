import {PeptideExportData} from "@/composables/usePeptideExport";
import {ShareableMap} from "shared-memory-datastructures";
import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
import {GoNamespace} from "@/composables/ontology/useGoOntology";
import usePercentage from "@/composables/usePercentage";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import PeptideData from "@/logic/ontology/peptides/PeptideData";

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async({
    peptideTable,
    goOntology,
    ecOntology,
    iprOntology,
    ncbiOntology,
    indexBuffer,
    dataBuffer,
    separator
}: PeptideExportData): Promise<string[][]> => {
    const generateHeader = () => {
        return [
            "peptide",
            "lca",
            ...Object.values(NcbiRank),
            "EC",
            "EC - names",
            ...Object.values(GoNamespace).map(ns => `GO (${ns})`),
            ...Object.values(GoNamespace).map(ns => `GO (${ns}) - names`),
            "InterPro",
            "InterPro - names",
        ];
    }

    const sortAnnotations = (
        annotations: [string, number][]
    ): [string, number][] => {
        return annotations
            .sort((a: [string, number], b: [string, number]) => {
                if (b[1] === a[1]) {
                    return a[0] < b[0] ? -1 : 1;
                }
                return b[1] - a[1]
            })
            .slice(0, 3);
    }

    const { displayPercentage } = usePercentage();

    const peptideToData = new ShareableMap<string, PeptideData>(
        0, 0, new PeptideDataSerializer()
    );
    peptideToData.setBuffers(indexBuffer, dataBuffer);

    // Make sure that the separator is not part of any of the values themselves
    const sanitizeRegex = new RegExp(`${separator}`, "g");

    const result: string[][] = [ generateHeader() ];

    for (const [peptide, peptideCount] of peptideTable) {
        const row = [peptide];

        const pept2DataResponse = peptideToData.get(peptide);

        if (!pept2DataResponse) {
            for (let i = 0; i < generateHeader().length - 1; i++) {
                row.push("");
            }
        } else {
            // Process the LCA
            row.push(ncbiOntology.get(pept2DataResponse.lca)?.name || "");

            // Process the LCA's lineage
            const lineage = ncbiOntology.get(pept2DataResponse.lca)?.lineage || [];
            row.push(...lineage.map((l: number) => ncbiOntology.get(l)?.name.replace(sanitizeRegex, "") || ""));
            for (let i = lineage.length; i < Object.values(NcbiRank).length; i++) {
                row.push("");
            }

            // Process the EC numbers
            const ecCodes = [];
            const ecDefinitions = [];
            const totalEcCounts = Object.values<number>(pept2DataResponse.ec).reduce((acc, current) => acc + current, 0);
            for (const [code, count] of sortAnnotations(Object.entries(pept2DataResponse.ec))) {
                const percentage = displayPercentage(count / totalEcCounts, 1).replace(".0%", "%");
                ecCodes.push(`${code.substring(3)} (${percentage})`);
                ecDefinitions.push(`${ecOntology.get(code)?.name || "Unknown"} (${percentage})`.replace(sanitizeRegex, ""));
            }

            row.push(
                ecCodes.join(separator),
                ecDefinitions.join(separator)
            );

            // Process the GO terms
            const goCodes = [];
            const goDefinitions = [];
            const totalGoCounts = Object.values<number>(pept2DataResponse.go).reduce((acc, current) => acc + current, 0);
            for (const ns of Object.values(GoNamespace)) {
                const goCodesInNamespace = Object.entries<number>(pept2DataResponse.go).filter(([go, _count]) =>
                    goOntology.get(go)?.namespace === ns
                );

                const tmpGoCodes = [];
                const tmpGoDefinitions = [];
                for (const [code, count] of sortAnnotations(goCodesInNamespace)) {
                    const percentage = displayPercentage(count / totalGoCounts, 1).replace(".0%", "%");
                    tmpGoCodes.push(`${code} (${percentage})`);
                    tmpGoDefinitions.push(`${goOntology.get(code)?.name || "Unknown"} (${percentage})`.replace(sanitizeRegex, ""));
                }

                goCodes.push(tmpGoCodes.join(separator));
                goDefinitions.push(tmpGoDefinitions.join(separator));
            }

            row.push(...goCodes, ...goDefinitions);

            // Process the InterPro entries
            const iprCodes = [];
            const iprDefinitions = [];
            const totalIprCounts = Object.values<number>(pept2DataResponse.ipr).reduce((acc: number, current: number) => acc + current, 0);
            for (const [code, count] of sortAnnotations(Object.entries(pept2DataResponse.ipr))) {
                const percentage = displayPercentage(count / totalIprCounts, 1).replace(".0%", "%");
                iprCodes.push(`${code.substring(4)} (${percentage})`);
                iprDefinitions.push(`${iprOntology.get(code)?.name || "Unknown"} (${percentage})`.replace(sanitizeRegex, ""));
            }

            row.push(
                iprCodes.join(separator),
                iprDefinitions.join(separator)
            );
        }

        for (let i = 0; i < peptideCount; i++) {
            result.push(row);
        }
    }

    return result;
}
