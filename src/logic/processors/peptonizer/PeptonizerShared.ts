export const DEFAULT_PEPTIDE_INTENSITIES = 0.7;

export const createDefaultPeptideIntensities = (
    peptides: Iterable<string>,
    defaultIntensity: number = DEFAULT_PEPTIDE_INTENSITIES
): Map<string, number> => {
    const intensities = new Map<string, number>();

    for (const peptide of peptides) {
        intensities.set(peptide, defaultIntensity);
    }

    return intensities;
};