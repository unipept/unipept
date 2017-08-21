const BATCH_SIZE = 1;

class Dataset {
    constructor(peptides = []) {
        this.originalPeptides = Dataset.cleanPeptides(peptides);
        this.length = this.originalPeptides.length;
    }

    process() {
        const startIds = Array.from({length: Math.ceil(this.length/BATCH_SIZE)}, (v, k) => k * BATCH_SIZE);
        startIds.reduce((sequence, startId) => {
            return sequence.then(() => {
                const data = JSON.stringify({
                    peptides: this.originalPeptides.slice(startId, startId + BATCH_SIZE),
                });
                return fetch("/mpa/pept2lca", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    body: data,
                }).then(res => res.json()).then(res => console.log(res));
            });
        }, Promise.resolve());
    }

    static cleanPeptides(peptides) {
        let cleanedPeptides = peptides.map(p => p.toUpperCase());
        return cleanedPeptides;
    }
}

export {Dataset};
