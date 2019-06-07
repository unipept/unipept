import {Normalizer} from "./Normalizer";

export default class AllNormalizer implements Normalizer {
    public normalize(data: number[][]): number[][] {
        if (data.length === 0 || data[0].length === 0) {
            return data;
        }

        let min = Infinity;
        let max = -Infinity;

        for (let row of data) {
            for (let value of row) {
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }

        let output: number[][] = [];

        for (let row of data) {
            let newRow: number[] = [];
            for (let value of row) {
                if (max - min != 0) {
                    newRow.push((value - min) / (max - min));
                } else {
                    newRow.push(0);
                }
            }
            output.push(newRow);
        }

        return output;
    }
}
