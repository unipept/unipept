class Dataset {
    constructor(peptides = []) {
        this.originalPeptides = Dataset.cleanPeptides(peptides);
    }

    process() {
        console.log(this.originalPeptides);
    }

    static cleanPeptides(peptides) {
        let cleanedPeptides = peptides.map(p => p.toUpperCase());
        return cleanedPeptides;
    }
}

export {Dataset};
