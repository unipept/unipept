import { defineStore } from 'pinia';
import PeptonizerAssay from '@/logic/peptonizer/PeptonizerAssay';
import {ref} from "vue";
import {GridSearchProgressListener, Peptonizer} from "peptonizer";

class Listener implements GridSearchProgressListener {
    gridUpdated(currentAlpha: number, currentBeta: number, currentPrior: number, workerId: number): void {
        console.log(`Updated grid: alpha -> ${currentAlpha}, beta ->  ${currentBeta}, prior -> ${currentPrior}, workerId -> ${workerId}.`);
    }

    graphsUpdated(currentGraph: number, totalGraphs: number, workerId: number): void {
        console.log(`Graphs updated: ${currentGraph} / ${totalGraphs}.`);
    }

    maxResidualUpdated(maxResidual: number, tolerance: number, workerId: number): void {
        console.log(`Max residual updated: ${maxResidual}.`)
    }

    iterationsUpdated(currentIteration: number, totalIterations: number, workerId: number): void {
        console.log(`Current iterations updated: ${currentIteration} / ${totalIterations}.`)
    }
}

export const usePeptonizerStore = defineStore('peptonizer', () => {
    const assay = ref(new PeptonizerAssay());

    // Parse CSV Data and populate peptideScoreMap in PeptonizerAssay
    const parseCsvData = (csvContent: string) => {
        assay.value.peptideScoreMap = new Map();
        const rows = csvContent.split('\n');
        rows.forEach(row => {
            const [peptide, score] = row.split('\t').map(col => col.trim());
            if (peptide && score && !isNaN(Number(score))) {
                assay.value.peptideScoreMap.set(peptide, parseFloat(score));
            }
        });
    };

    const parsePsmFile = (fileContent: string) => {
        assay.value.peptideScoreMap = new Map();

        const rows = fileContent.trim().split("\n");
        const header = rows[0].split("\t");

        // Find indices for "peptidoform" and "score" columns
        const peptidoformIndex = header.indexOf("peptidoform");
        const scoreIndex = header.indexOf("score");

        if (peptidoformIndex === -1 || scoreIndex === -1) {
            throw new Error("Missing required columns: 'peptidoform' or 'score'");
        }

        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].split("\t");
            const peptidoform = columns[peptidoformIndex];
            const score = parseFloat(columns[scoreIndex]);

            if (isNaN(score)) continue; // Skip invalid scores

            // Remove charge state and modifications (everything after `/` or any modifications in brackets)
            const cleanedPeptide = peptidoform
                .replace(/\/\d+$/, "") // Remove charge state
                .replace(/\[.*?\]/g, ""); // Remove modifications

            assay.value.peptideScoreMap.set(cleanedPeptide, score);
        }
    }

    /**
     * Start running the peptonizer algorithm for the data that has been parsed before.
     */
    const runPeptonizer = async (fileContent: string) => {
        const peppie: Peptonizer = new Peptonizer();
        const result = await peppie.peptonize(
            fileContent,
            [0.8, 0.9, 0.99],
            [0.6, 0.7],
            [0.1, 0.3, 0.5],
            new Listener()
        );

        console.log(result);
    }

    return {
        assay,
        parseCsvData,
        parsePsmFile,
        runPeptonizer
    };
});
