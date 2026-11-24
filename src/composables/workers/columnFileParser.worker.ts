import {ColumnFileParserData} from "@/components/sample/upload/useColumnFileParser";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async ({
    linesBuffer,
    useFirstRowAsHeader,
    sanitizeSequenceColumn,
    selectedSequenceColumn,
    selectedIntensitiesColumn,
    delimiter
}: ColumnFileParserData) => {
    let rowStart = 1;
    let columns = [];
    let rows = [];
    let rawPeptides = "";
    let intensities = undefined;
    let validPeptides = false;
    let validIntensities = false;

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
        let rowIdx = rowStart;
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
        let rowIdx = rowStart;
        while (rowIdx < rows.length) {
            const row = rows[rowIdx];
            validIntensities = validIntensities && !isNaN(parseFloat(row[selectedIntensitiesColIdx]));
            rowIdx++;
        }
    }

    if (validPeptides) {
        rawPeptides = rows.slice(rowStart).map((row) => row[selectedSeqColIdx]).join("\n");
    }

    if (selectedIntensitiesColumn !== "" && validIntensities) {
        intensities = new Map<string, number>(
            rows.slice(rowStart).map((row) => [row[selectedSeqColIdx], parseFloat(row[selectedIntensitiesColIdx])])
        );
    }

    return {
        rowStart,
        columns,
        // The rows are only used for a preview, so the worker doesn't have to send back an entire file
        rows: rows.slice(rowStart, rowStart + 5),
        rawPeptides,
        intensities,
        validPeptides,
        validIntensities
    };
};

const stripPeptideSequence = function(peptide: string): string {
    // Regular expression to match PTMs (e.g., [modification]) and charge states (e.g., +2, -3, /+2, /-3)
    return peptide.replace(/\[.*?\]|\/?[+-]?\d+/g, '');
}

const isValidPeptide = function(sequence: string): boolean {
    // Regular expression to check if the string contains only letters
    return /^[A-Za-z]+$/.test(sequence);
}
