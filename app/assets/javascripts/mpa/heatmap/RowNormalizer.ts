import {Normalizer} from "./Normalizer";

export default class RowNormalizer implements Normalizer {
    public normalize(data: number[][]): number[][] {
        if (data.length === 0 || data[0].length === 0) {
            return data;
        }

        let output: number[][] = [];
        for (let row of data) {
            let min = Math.min(...row);
            let max = Math.max(...row);

            let newRow = [];
            for (let item of row) {
                if (max - min != 0) {
                    newRow.push((item - min) / (max - min));
                } else {
                    newRow.push(0);
                }
            }
            output.push(newRow);
        }
        return output;
    }
}
