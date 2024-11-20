import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import {GoNamespace, NcbiRank} from "@/components/new/results/taxonomic/heatmap/DataSourceSelect.vue";
import useOntologyStore from "@/store/new/OntologyStore";
import usePercentage from "@/composables/new/usePercentage";

export default function usePeptideExport() {
    const {
        getNcbiDefinition,
        getEcDefinition,
        getGoDefinition,
        getIprDefinition
    } = useOntologyStore();

    const { displayPercentage } = usePercentage();

    const generateExport = (
        analysis: SingleAnalysisStore,
        separator = ";"
    ): string[][] => {
        const sanitizeRegex = new RegExp(`${separator}`, "g");

        const result: string[][] = [ generateHeader() ];

        for (const [peptide, peptideCount] of analysis.peptidesTable) {
            const row = [ peptide ];

            const pept2dataResponse = analysis.peptideToData.get(peptide);
            if (!pept2dataResponse) {
                for (let i = 0; i < generateHeader().length - 1; i++) {
                    row.push("");
                }
            } else {
                // Process the LCA
                row.push(getNcbiDefinition(pept2dataResponse.lca)?.name || "");

                // Process the LCA's lineage
                const lineage = getNcbiDefinition(pept2dataResponse.lca)?.lineage || [];
                row.push(...lineage.map(l => getNcbiDefinition(l)?.name.replace(sanitizeRegex, "") || ""));
                for (let i = lineage.length; i < Object.values(NcbiRank).length; i++) {
                    row.push("");
                }

                // Process the EC numbers
                const ecCodes = [];
                const ecDefinitions = [];
                const totalEcCounts = Object.values(pept2dataResponse.ec).reduce((a, b) => a + b, 0);
                for (const [code, count] of sortAnnotations(Object.entries(pept2dataResponse.ec))) {
                    const percentage = displayPercentage(count / totalEcCounts, 1).replace(".0%", "%");
                    ecCodes.push(`${code.substring(3)} (${percentage})`);
                    ecDefinitions.push(`${getEcDefinition(code)?.name || "Unknown"} (${percentage})`.replace(sanitizeRegex, ""));
                }

                row.push(
                    ecCodes.join(separator),
                    ecDefinitions.join(separator)
                );

                // Process the GO terms
                const goCodes = [];
                const goDefinitions = [];
                const totalGoCounts = Object.values(pept2dataResponse.go).reduce((a, b) => a + b, 0);
                for (const ns of Object.values(GoNamespace)) {
                    const goCodesInNamespace = Object.entries(pept2dataResponse.go).filter(([go, count]) =>
                        getGoDefinition(go)?.namespace === ns
                    );

                    const tmpGoCodes = [];
                    const tmpGoDefinitions = [];
                    for (const [code, count] of sortAnnotations(goCodesInNamespace)) {
                        const percentage = displayPercentage(count / totalGoCounts, 1).replace(".0%", "%");
                        tmpGoCodes.push(`${code} (${percentage})`);
                        tmpGoDefinitions.push(`${getGoDefinition(code)?.name || "Unknown"} (${percentage})`.replace(sanitizeRegex, ""));
                    }

                    goCodes.push(tmpGoCodes.join(separator));
                    goDefinitions.push(tmpGoDefinitions.join(separator));
                }

                row.push(...goCodes, ...goDefinitions);

                // Process the InterPro entries
                const iprCodes = [];
                const iprDefinitions = [];
                const totalIprCounts = Object.values(pept2dataResponse.ipr).reduce((a, b) => a + b, 0);
                for (const [code, count] of sortAnnotations(Object.entries(pept2dataResponse.ipr))) {
                    const percentage = displayPercentage(count / totalIprCounts, 1).replace(".0%", "%");
                    iprCodes.push(`${code.substring(4)} (${percentage})`);
                    iprDefinitions.push(`${getIprDefinition(code)?.name || "Unknown"} (${percentage})`.replace(sanitizeRegex, ""));
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
    };

    const sortAnnotations = (
        annotations: [string, number]
    ): [string, number][] => {
        return annotations
            .sort((a, b) => {
                if (b[1] === a[1]) {
                    return a[0] < b[0] ? -1 : 1;
                }
                return b[1] - a[1]
            })
            .slice(0, 3);
    }

    return {
        generateExport
    }
}
