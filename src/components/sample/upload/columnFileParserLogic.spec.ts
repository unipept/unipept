import { describe, it, expect } from 'vitest';
import { process } from './columnFileParserLogic';
import { ColumnFileParserData } from './useColumnFileParser';

describe('columnFileParserLogic', () => {
    const textEncoder = new TextEncoder();

    const createBuffer = (content: string) => textEncoder.encode(content);

    it('should parse simple CSV with peptides', async () => {
        const csv = `Peptide,Intensity
AAAAA,100
BBBBB,200`;

        const data: ColumnFileParserData = {
            linesBuffer: createBuffer(csv),
            useFirstRowAsHeader: true,
            sanitizeSequenceColumn: true,
            selectedSequenceColumn: 'Peptide',
            selectedIntensitiesColumn: 'Intensity',
            delimiter: ','
        };

        const result = await process(data);

        expect(result.validPeptides).toBe(true);
        expect(result.validIntensities).toBe(true);
        expect(result.rawPeptides).toBe('AAAAA\nBBBBB');
        expect(result.intensities?.get('AAAAA')).toBe(100);
        expect(result.intensities?.get('BBBBB')).toBe(200);
    });

    it('should filter peptides based on FDR threshold', async () => {
        const csv = `Peptide,Intensity,FDR
AAAAA,100,0.01
BBBBB,200,0.05
CCCCC,300,0.001`;

        // Casting to any to allow passing new properties before interface update
        const data: any = {
            linesBuffer: createBuffer(csv),
            useFirstRowAsHeader: true,
            sanitizeSequenceColumn: true,
            selectedSequenceColumn: 'Peptide',
            selectedIntensitiesColumn: 'Intensity',
            selectedFdrColumn: 'FDR',
            fdrThreshold: 0.02,
            delimiter: ','
        };

        const result = await process(data);

        // Currently logic not implemented, so it will return all peptides
        // Once implemented, it should only return AAAAA and CCCCC
        // expect(result.rawPeptides).toBe('AAAAA\nCCCCC');
        // For now, let's just assert it runs without crashing, or assert the expected behavior and expect it to fail?
        // I will assert the expected behavior. This test will FAIL until I implement the logic.
        expect(result.rawPeptides).toContain('AAAAA');
        expect(result.rawPeptides).toContain('CCCCC');
        expect(result.rawPeptides).not.toContain('BBBBB');

        // Also check intensities
        expect(result.intensities?.has('AAAAA')).toBe(true);
        expect(result.intensities?.has('CCCCC')).toBe(true);
        expect(result.intensities?.has('BBBBB')).toBe(false);
    });
});
