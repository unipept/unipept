export enum NormalizationType {
    All = 'all',
    Rows = 'rows',
    Columns = 'columns'
}

export default function useNormalization() {
    const normalizeAll = (data: number[][]): number[][] => {
        if (data.length === 0 || data[0].length === 0) {
            return data;
        }

        let min = Infinity;
        let max = -Infinity;
        for (const row of data) {
            min = Math.min(min, ...row);
            max = Math.max(max, ...row);
        }

        const normalizedData: number[][] = [];

        for (const row of data) {
            const newRow: number[] = [];
            for (const value of row) {
                if (max - min !== 0) {
                    newRow.push((value - min) / (max - min));
                } else {
                    newRow.push(0);
                }
            }
            normalizedData.push(newRow);
        }

        return normalizedData;
    }

    const normalizeRows = (data: number[][]): number[][] => {
        if (data.length === 0 || data[0].length === 0) {
            return data;
        }

        const normalizedData: number[][] = [];
        for (const row of data) {
            const min = Math.min(...row);
            const max = Math.max(...row);

            const newRow: number[] = [];
            for (const value of row) {
                if (max - min !== 0) {
                    newRow.push((value - min) / (max - min));
                } else {
                    newRow.push(0);
                }
            }
            normalizedData.push(newRow);
        }

        return normalizedData;
    }

    const normalizeColumns = (data: number[][]): number[][] => {
        if (data.length === 0 || data[0].length === 0) {
            return data;
        }

        const normalizedData: number[][] = [];

        for (const _ of data) {
            normalizedData.push([]);
        }

        for (let col = 0; col < data[0].length; col++) {
            // Find the minimum and maximum value by iterating over every value in the current column
            const minMax: number[] = Array.from(
                Array(data.length).keys()
            )
                .map(
                    (row) => data[row][col]).reduce((acc, current) => [Math.min(acc[0], current),
                    Math.max(acc[1], current)], [Infinity, -Infinity],
                );
            const min = minMax[0];
            const max = minMax[1];

            for (let row = 0; row < data.length; row++) {
                if (max - min !== 0) {
                    normalizedData[row].push((data[row][col] - min) / (max - min));
                } else {
                    normalizedData[row].push(0);
                }
            }
        }

        return normalizedData;
    }

    return {
        normalizeAll,
        normalizeRows,
        normalizeColumns
    }
}
