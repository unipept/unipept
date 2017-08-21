import {Dataset} from "./dataset.js";

class MPA {
    constructor(peptides = []) {
        this.datasets = [];
        this.addDataset(peptides);
    }

    addDataset(peptides) {
        let dataset = new Dataset(peptides);
        this.datasets.push(dataset);
        dataset.process();
    }
}

export {MPA};
