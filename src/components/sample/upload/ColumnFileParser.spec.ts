
import { describe, it, expect } from 'vitest';
import { process, ColumnFileParserWorkerOutput } from './ColumnFileParser';
import { ColumnFileParserData } from './useColumnFileParser';

describe('ColumnFileParser', () => {
    const encoder = new TextEncoder();

    const createData = (content: string, overrides: Partial<ColumnFileParserData> = {}): ColumnFileParserData => ({
        linesBuffer: encoder.encode(content),
        useFirstRowAsHeader: true,
        sanitizeSequenceColumn: true,
        selectedSequenceColumn: 'peptide',
        selectedIntensitiesColumn: '',
        delimiter: ',',
        selectedFdrColumn: '',
        fdrThreshold: 0.01,
        ...overrides
    });

    it('should parse simple CSV with header', async () => {
        const content = `peptide,score\nAAAAA,10\nBBBBB,20`;
        const result = await process(createData(content));

        expect(result.validPeptides).toBe(true);
        expect(result.rawPeptides).toBe('AAAAA\nBBBBB');
        expect(result.columns).toEqual(['peptide', 'score']);
    });

    it('should handle different delimiters', async () => {
        const content = `peptide;score\nAAAAA;10\nBBBBB;20`;
        const result = await process(createData(content, { delimiter: ';' }));

        expect(result.validPeptides).toBe(true);
        expect(result.rawPeptides).toBe('AAAAA\nBBBBB');
    });

    it('should sanitize sequences', async () => {
        const content = `peptide\nAAAAA[+10]\nBBBBB/2`;
        const result = await process(createData(content));

        expect(result.rawPeptides).toBe('AAAAA\nBBBBB');
    });

    it('should validate peptides', async () => {
        const content = `peptide\nAAAAA\nB1B2B`;
        const result = await process(createData(content, { sanitizeSequenceColumn: false }));

        expect(result.validPeptides).toBe(false);
    });

    it('should parse intensities', async () => {
        const content = `peptide,intensity\nAAAAA,10.5\nBBBBB,20.1`;
        const result = await process(createData(content, { selectedIntensitiesColumn: 'intensity' }));

        expect(result.validIntensities).toBe(true);
        expect(result.intensities?.get('AAAAA')).toBe(10.5);
        expect(result.intensities?.get('BBBBB')).toBe(20.1);
    });

    it('should validate intensities', async () => {
        const content = `peptide,intensity\nAAAAA,10.5\nBBBBB,invalid`;
        const result = await process(createData(content, { selectedIntensitiesColumn: 'intensity' }));

        expect(result.validIntensities).toBe(false);
    });

    describe('FDR Filtering', () => {
        const content = `peptide,fdr\nAAAAA,0.001\nBBBBB,0.01\nCCCCC,0.05\nDDDDD,0.1\nEEEEE,invalid`;

        it('should filter by FDR 0.05', async () => {
            const result = await process(createData(content, { selectedFdrColumn: 'fdr', fdrThreshold: 0.05 }));
            expect(result.rawPeptides).toBe('AAAAA\nBBBBB\nCCCCC');
        });

        it('should filter by FDR 0.01', async () => {
            const result = await process(createData(content, { selectedFdrColumn: 'fdr', fdrThreshold: 0.01 }));
            expect(result.rawPeptides).toBe('AAAAA\nBBBBB');
        });

        it('should filter by FDR 0.001', async () => {
            const result = await process(createData(content, { selectedFdrColumn: 'fdr', fdrThreshold: 0.001 }));
            expect(result.rawPeptides).toBe('AAAAA');
        });

        it('should handle custom thresholds', async () => {
            const result = await process(createData(content, { selectedFdrColumn: 'fdr', fdrThreshold: 0.02 }));
            expect(result.rawPeptides).toBe('AAAAA\nBBBBB');
        });

        it('should exclude invalid FDR values', async () => {
            // The 'EEEEE' row has 'invalid' FDR, so it should be excluded even if threshold is high
            const result = await process(createData(content, { selectedFdrColumn: 'fdr', fdrThreshold: 1.0 }));
            expect(result.rawPeptides).toContain('AAAAA');
            expect(result.rawPeptides).toContain('BBBBB');
            expect(result.rawPeptides).toContain('CCCCC');
            expect(result.rawPeptides).toContain('DDDDD');
            expect(result.rawPeptides).not.toContain('EEEEE');
            expect(result.validFdr).toBe(false);
        });

        it('should not filter if no FDR column is selected', async () => {
            const result = await process(createData(content, { selectedFdrColumn: '', fdrThreshold: 0.01 }));
            // Should include all valid peptides
            expect(result.rawPeptides).toContain('AAAAA');
            expect(result.rawPeptides).toContain('BBBBB');
            expect(result.rawPeptides).toContain('CCCCC');
            expect(result.rawPeptides).toContain('DDDDD');
            expect(result.rawPeptides).toContain('EEEEE');
        });
    });
});
