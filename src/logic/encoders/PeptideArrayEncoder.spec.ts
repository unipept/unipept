import {describe, it, expect} from "vitest";
import PeptideArrayEncoder from "./PeptideArrayEncoder";

describe("PeptideArrayEncoder", () => {
    it("should correctly encode and decode an array of peptides", () => {
        const encoder = new PeptideArrayEncoder();
        const peptides = ["PEPTIDE", "TEST", "ARRAY", "ABC"];

        // Calculate max length to allocate buffer
        const maxSize = encoder.maximumLength(peptides);
        const buffer = new Uint8Array(maxSize);

        // Encode
        const bytesWritten = encoder.encode(peptides, buffer);

        // Check that bytes written is within max size
        expect(bytesWritten).toBeLessThanOrEqual(maxSize);
        expect(bytesWritten).toBeGreaterThan(0);

        // Decode (using only the written part of the buffer)
        const encodedBuffer = buffer.slice(0, bytesWritten);
        const decoded = encoder.decode(encodedBuffer);

        expect(decoded).toEqual(peptides);
    });

    it("should handle array with empty string", () => {
        const encoder = new PeptideArrayEncoder();
        const emptyStringArray = [""];
        const maxSize = encoder.maximumLength(emptyStringArray);
        const buffer = new Uint8Array(maxSize);

        const bytesWritten = encoder.encode(emptyStringArray, buffer);
        const decoded = encoder.decode(buffer.slice(0, bytesWritten));

        expect(decoded).toEqual(emptyStringArray);
    });

    it("should handle empty array (note: decodes as [''])", () => {
        const encoder = new PeptideArrayEncoder();
        const emptyArray: string[] = [];

        const maxSize = encoder.maximumLength(emptyArray);
        const buffer = new Uint8Array(Math.max(1, maxSize));

        const bytesWritten = encoder.encode(emptyArray, buffer);
        expect(bytesWritten).toBe(8);

        const decoded = encoder.decode(buffer.slice(0, bytesWritten));
        // Expect [""] due to split behavior
        expect(decoded).toEqual([]);
    });

    it("should calculate maximumLength reasonably", () => {
        const encoder = new PeptideArrayEncoder();
        const peptides = ["A", "B"];

        // max length is for characters A, B and the delimiter (;) plus 8 bytes for length -> 11 bytes
        expect(encoder.maximumLength(peptides)).toBe(11);
    });
});
