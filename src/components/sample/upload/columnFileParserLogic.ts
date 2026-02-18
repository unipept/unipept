import {ColumnFileParserData} from "@/components/sample/upload/useColumnFileParser";

export const process = async ({
    linesBuffer,
    useFirstRowAsHeader,
    sanitizeSequenceColumn,
    selectedSequenceColumn,
    selectedIntensitiesColumn,
    selectedFdrColumn,
    fdrThreshold,
    delimiter
}: ColumnFileParserData) => {
    let rowStart = 1;
    let columns = [];
    let rows = [];
    let rawPeptides = "";
    let intensities = undefined;
    let validPeptides = false;
    let validIntensities = false;
    let validFdr = true;

    const lines = new TextDecoder().decode(linesBuffer).split(/\r?\n/);

    // First parse the header
    if (useFirstRowAsHeader) {
        columns = lines[0].split(delimiter);
    } else {
        rowStart = 0;
        const columnCount = lines[0].split(delimiter).length;
        columns = [];
        for (let i = 0; i < columnCount; i++) {
            columns.push(`Column ${i + 1}`);
        }
    }

    // Reset rows
    rows = [];
    for (const line of lines.slice(rowStart)) {
        if (line.trim() !== "") {
            rows.push(line.trim().split(delimiter));
        }
    }

    // Filter by FDR if selected and valid
    if (selectedFdrColumn && selectedFdrColumn !== "") {
        const selectedFdrColIdx = columns.indexOf(selectedFdrColumn);

        if (selectedFdrColIdx >= 0 && selectedFdrColIdx < columns.length) {
            // Test if all FDR values are valid
            let rowIdx = 0;
            while (rowIdx < rows.length && validFdr) {
                const row = rows[rowIdx];
                // Check if it is a number
                validFdr = validFdr && !isNaN(parseFloat(row[selectedFdrColIdx]));
                rowIdx++;
            }

            // If valid, filter the rows
            if (validFdr && fdrThreshold !== undefined) {
                rows = rows.filter(row => parseFloat(row[selectedFdrColIdx]) >= fdrThreshold);
            }
        }
    }

    // Figure out which column index has been selected by the user for the peptide sequences.
    const selectedSeqColIdx = columns.indexOf(selectedSequenceColumn);
    validPeptides = true;

    if (selectedSeqColIdx >= 0 && selectedSeqColIdx < columns.length) {
        if (sanitizeSequenceColumn) {
            for (const row of rows) {
                row[selectedSeqColIdx] = stripPeptideSequence(row[selectedSeqColIdx]);
            }
        }

        // Test if all peptides are valid sequences
        let rowIdx = 0;
        while (rowIdx < rows.length && validPeptides) {
            const row = rows[rowIdx];
            validPeptides = validPeptides && isValidPeptide(row[selectedSeqColIdx]);
            rowIdx++;
        }
    } else {
        validPeptides = false;
    }

    const selectedIntensitiesColIdx = columns.indexOf(selectedIntensitiesColumn);
    validIntensities = true;

    if (selectedIntensitiesColIdx >= 0 && selectedIntensitiesColIdx < columns.length) {
        // Test if all intensities are valid
        let rowIdx = 0;
        while (rowIdx < rows.length) {
            const row = rows[rowIdx];
            validIntensities = validIntensities && !isNaN(parseFloat(row[selectedIntensitiesColIdx]));
            rowIdx++;
        }
    }

    if (validPeptides) {
        rawPeptides = rows.map((row) => row[selectedSeqColIdx]).join("\n");
    }

    if (selectedIntensitiesColumn !== "" && validIntensities) {
        intensities = new Map<string, number>(
            rows.map((row) => [row[selectedSeqColIdx], parseFloat(row[selectedIntensitiesColIdx])])
        );
    }

    return {
        rowStart,
        columns,
        // The rows are only used for a preview, so the worker doesn't have to send back an entire file
        rows: rows.slice(0, 5),
        rawPeptides,
        intensities,
        validPeptides,
        validIntensities,
        validFdr
    };
};

export const stripPeptideSequence = function(peptide: string): string {
    // Regular expression to match PTMs (e.g., [modification]) and charge states (e.g., +2, -3, /+2, /-3)
    return peptide.replace(/\[.*?\]|\/?[+-]?\d+/g, '');
}

export const isValidPeptide = function(sequence: string): boolean {
    // Regular expression to check if the string contains only letters
    return /^[A-Za-z]+$/.test(sequence);
}
