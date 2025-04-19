import useOntologyStore from "@/store/OntologyStore";

export default function usePeptonizerExport() {
    const {
        getNcbiDefinition
    } = useOntologyStore();

    const generateExport = (
        taxonIdToConfidence: Map<number, number>
    ): string[][] => {
        const peptonizerHeaders = [
            "Taxon - NCBI ID",
            "Taxon - name",
            "Peptonizer - confidence"
        ];

        const output: string[][] = [peptonizerHeaders];

        for (const [taxonId, confidence] of taxonIdToConfidence) {
            const taxonName: string = getNcbiDefinition(taxonId)?.name || "";
            output.push([
                taxonId.toString(),
                taxonName,
                confidence.toString()
            ]);
        }

        return output;
    }

    return {
        generateExport
    }
}
