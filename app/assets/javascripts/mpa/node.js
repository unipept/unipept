
class Node {
    constructor(id, name="") {
        this.id = id;
        this.name = name;
        this.children = [];
        this.values = [];
        this.data = {
            self_count: 0,
        };
    }

    getChild(taxId) {
        for (let child of this.children) {
            if (child.id === taxId) {
                return child;
            }
        }
        return null;
    }

    getChildCount() {
        return this.children.length;
    }

    addChild(node) {
        this.children.push(node);
    }

    addValue(peptide) {
        this.values.push({
            sequence: peptide.sequence,
            count: peptide.count,
            lca: peptide.lca,
        });
        this.data.self_count += peptide.count;
    }

    getCounts() {
        if (this.data.count === undefined) {
            this.data.count = this.data.self_count;
            if (this.getChildCount() !== 0) {
                this.data.count += this.children.reduce((sum, c) => sum + c.getCounts(), 0);
            }
        }
        return this.data.count;
    }
}

export {Node};
