import {describe, expect, it} from "vitest";
import PeptideArrayEncoder from "./PeptideArrayEncoder";

describe("PeptideArrayEncoder", () => {
    const encoder = new PeptideArrayEncoder();

    it("should correctly encode and decode a simple array of peptides", () => {
        const peptides = ["PEPTIDE", "TEST", "SAMPLE"];
        const buffer = new Uint8Array(encoder.maximumLength(peptides));

        encoder.encode(peptides, buffer);
        const decoded = encoder.decode(buffer);

        expect(decoded).toEqual(peptides);
    });

    it("should correctly encode and decode a single peptide", () => {
        const peptides = ["SINGLE"];
        const buffer = new Uint8Array(encoder.maximumLength(peptides));

        encoder.encode(peptides, buffer);
        const decoded = encoder.decode(buffer);

        expect(decoded).toEqual(peptides);
    });

    it("should calculate a sufficient maximum length", () => {
        const peptides = ["ABC", "DEF", "GHI"];
        // Length of strings (3+3+3) + (3-1) separators = 9 + 2 = 11?
        // Implementation: object.reduce((acc, s) => acc + s.length, 0) + Math.max(0, object.length - 1);
        // 9 + 2 = 11.
        const maxLen = encoder.maximumLength(peptides);
        expect(maxLen).toBeGreaterThanOrEqual(11);

        const buffer = new Uint8Array(maxLen);
        const writtenBytes = encoder.encode(peptides, buffer);
        expect(writtenBytes).toBeLessThanOrEqual(maxLen);
    });

    it("should handle empty strings in array", () => {
        const peptides = ["A", "", "B"];
        const buffer = new Uint8Array(encoder.maximumLength(peptides));

        encoder.encode(peptides, buffer);
        const decoded = encoder.decode(buffer);

        expect(decoded).toEqual(peptides);
    });
});
