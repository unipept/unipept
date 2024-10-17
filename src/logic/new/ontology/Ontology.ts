import Code from "@/logic/new/ontology/Code";
import Definition from "@/logic/new/ontology/Definition";

export default class Ontology<C extends Code, D extends Definition> extends Map<C, D> {
    constructor(ontology: Map<C, D>) {
        super(ontology);
    }

    keys(): C[] {
        return Array.from(super.keys());
    }
}
