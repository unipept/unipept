import {Dataset} from "./dataset.js";

class MPA {
    constructor(peptides = []) {
        this.datasets = [];
        this.addDataset(peptides);
    }

    async addDataset(peptides) {
        let dataset = new Dataset(peptides);
        this.datasets.push(dataset);
        let tree = await dataset.process();
        console.log(tree);
    }
}

export {MPA};
