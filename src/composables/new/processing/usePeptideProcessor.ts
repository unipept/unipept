import {useWebWorkerFn} from "@vueuse/core";

export default function usePeptideProcessor() {
    const process = (
        peptides: string[],
        equateIL: boolean,
        filterDuplicates: boolean
    ): [ Map<string, number>, number ] => {
        peptides = preprocess(peptides, equateIL);

        const peptideCounts = new Map<string, number>();
        for (const peptide of peptides) {
            const count = peptideCounts.get(peptide) || 0;
            peptideCounts.set(peptide, filterDuplicates ? 1 : count + 1);
        }

        const totalFrequency = peptideCounts.values().reduce((a, b) => a + b, 0);

        return [ peptideCounts, totalFrequency ];
    }

    const preprocess = (
        peptides: string[],
        equateIL: boolean
    ) => {
        return peptides
            .filter((p) => p.length >= 5)
            .map(p => equateIL ? p.replace(/I/g, 'L') : p);
    }

    const { workerFn: processOnWorker } = useWebWorkerFn(
        process,
        {
            localDependencies: [ preprocess ]
        }
    );

    return {
        process,
        processOnWorker
    };
}
