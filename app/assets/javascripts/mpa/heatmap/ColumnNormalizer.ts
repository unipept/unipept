import {Normalizer} from "./Normalizer";

export default class ColumnNormalizer implements Normalizer {
    public normalize(data: number[][]): number[][] {
        if (data.length === 0 || data[0].length === 0) {
            return data;
        }

        let output: number[][] = [];

        for (let row = 0; row < data.length; row++) {
            output.push([]);
        }

        for (let col = 0; col < data[0].length; col++) {
            console.log(Array(data[0].length).map(row => data[row][col]));

            // Find the minimum and maximum value by iterating over every value in the current column
            let minMax: number[] = Array.from(Array(data[0].length).keys()).map(row => data[row][col]).reduce((acc, current) => [Math.min(acc[0], current), Math.max(acc[1], current)], [Infinity, -Infinity]);
            let min = minMax[0];
            let max = minMax[1];

            console.log(min);
            console.log(max);

            for (let row = 0; row < data.length; row++) {
                output[row].push((data[row][col] - min) / (max - min));
            }
        }

        return output;
    }
}
