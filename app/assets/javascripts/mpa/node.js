
class Node {
    constructor(id, name="") {
        this.id = id;
        this.name = name;
        this.children = [];
        this.values = [];
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
        this.values.push(peptide);
    }
}

export {Node};
