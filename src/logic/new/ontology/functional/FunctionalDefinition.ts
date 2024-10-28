import FunctionalNamespace from "@/logic/new/ontology/functional/FunctionalNamespace";
import Definition from "@/logic/new/ontology/Definition";

export default class FunctionalDefinition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: FunctionalNamespace
    ) {}
}
