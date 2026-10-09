export const DEFAULT_PEPTIDE_INTENSITIES = 0.7;

// Helpers that build the input of the Peptonizer. If equateIl is true, peptides that only differ in I and L are
// merged into one peptide, because they match the same proteins.

export const canonicalizePeptide = (peptide: string, equateIl: boolean): string => {
    return equateIl ? peptide.toUpperCase().replace(/I/g, "L") : peptide;
};

// Sums the counts of the peptides that are merged
export const mergePeptideCounts = (
    counts: Iterable<[string, number]>,
    equateIl: boolean
): Map<string, number> => {
    const merged = new Map<string, number>();
    for (const [peptide, count] of counts) {
        const canonical = canonicalizePeptide(peptide, equateIl);
        merged.set(canonical, (merged.get(canonical) || 0) + count);
    }
    return merged;
};

// Keeps the first intensity of the peptides that are merged. Peptides without an intensity get the default intensity.
export const mergePeptideIntensities = (
    intensities: Iterable<[string, number]> | undefined,
    peptides: Iterable<string>,
    equateIl: boolean
): Map<string, number> => {
    const merged = new Map<string, number>();
    for (const [peptide, intensity] of intensities ?? []) {
        const canonical = canonicalizePeptide(peptide, equateIl);
        if (!merged.has(canonical)) {
            merged.set(canonical, intensity);
        }
    }

    for (const peptide of peptides) {
        if (!merged.has(peptide)) {
            merged.set(peptide, DEFAULT_PEPTIDE_INTENSITIES);
        }
    }
    return merged;
};

// Combines the annotations (taxa or functional terms) of the peptides that are merged, without duplicates. The
// arrays of peptides that are not merged are reused, because copying all taxa of a large sample is slow.
export const mergePeptideAnnotations = <T>(
    annotations: Iterable<[string, T[]]>,
    equateIl: boolean
): Map<string, T[]> => {
    const merged = new Map<string, T[]>();
    for (const [peptide, values] of annotations) {
        const canonical = canonicalizePeptide(peptide, equateIl);
        const existing = merged.get(canonical);
        merged.set(canonical, existing ? Array.from(new Set([...existing, ...values])) : values);
    }
    return merged;
};
