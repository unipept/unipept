import FunctionalNamespace from "@/logic/new/ontology/functional/FunctionalNamespace";

export default class FunctionalDefinition {
    constructor(
        public readonly code: string,
        public readonly name: string,
        public readonly namespace: FunctionalNamespace
    ) {}
}
