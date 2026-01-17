import { describe, it } from 'vitest';
import PeptideData from './PeptideData';
import PeptideDataResponse from './PeptideDataResponse';
import PeptideDataSerializer from './PeptideDataSerializer';

describe('PeptideDataSerializer Benchmark', () => {
    it('benchmarks encode performance', () => {
        // Create a large dataset
        const taxa = [];
        for (let i = 0; i < 1000; i++) {
            taxa.push(i);
        }
        const lineage = [];
        for (let i = 0; i < 100; i++) {
            lineage.push(i % 2 === 0 ? i : null);
        }

        const faData: any = {};
        for(let i=0; i<100; i++) {
            faData[`EC:1.2.3.${i}`] = i;
            faData[`GO:000000${i}`] = i;
            faData[`IPR:IPR0000${i}`] = i;
        }

        const response: PeptideDataResponse = {
            lca: 12345,
            lineage: lineage,
            fa: {
                counts: {
                    all: 300,
                    EC: 100,
                    GO: 100,
                    IPR: 100
                },
                data: faData
            },
            taxa: taxa
        };

        const peptideData = PeptideData.createFromPeptideDataResponse(response);
        const serializer = new PeptideDataSerializer();
        const bufferSize = serializer.maximumLength(peptideData);
        const destination = new Uint8Array(bufferSize);

        const iterations = 10000;
        const start = performance.now();

        for (let i = 0; i < iterations; i++) {
            serializer.encode(peptideData, destination);
        }

        const end = performance.now();
        const duration = end - start;
        console.log(`\n\nBenchmark Results:\nIterations: ${iterations}\nTotal Time: ${duration.toFixed(2)}ms\nAverage Time: ${(duration / iterations).toFixed(4)}ms\n\n`);
    });
});
