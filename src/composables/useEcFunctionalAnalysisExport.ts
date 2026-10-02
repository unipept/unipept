import useOntologyStore from "@/store/OntologyStore";

export default function useEcFunctionalAnalysisExport() {
    const { getEcDefinition } = useOntologyStore();

    const generateExport = (
        ecTermsToConfidence: Map<string, number>
    ): string[][] => {
        const headers = [
            "EC term",
            "EC name",
            "Confidence"
        ];

        const output: string[][] = [headers];

        for (const [ecTerm, confidence] of ecTermsToConfidence) {
            const ecName: string = getEcDefinition(ecTerm)?.name || "";
            output.push([
                ecTerm,
                ecName,
                confidence.toString()
            ]);
        }

        return output;
    }

    return {
        generateExport
    }
}
