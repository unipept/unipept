export default class Ontology<O extends OntologyCode, D extends OntologyDefinition> extends Map<O, number> {
    public readonly totalCount: number;

    constructor(counts: Map<O, number>, totalCount?: number) {
        super(counts);
        this.totalCount = totalCount ??
            [...counts.values()].reduce((a, b) => a + b, 0);
    }

    getOrDefault(key: O, defaultValue = 0): number {
        return this.get(key) ?? defaultValue;
    }

    keys(): O[] {
        return Array.from(super.keys());
    }
}

type EcCode = string;
type GoTerm = string;
type InterproEntry = string;
type FunctionalCode = EcCode | GoTerm | InterproEntry;
type NcbiId = number;
type UniprotAccessionId = string;
type OntologyCode = FunctionalCode | NcbiId | UniprotAccessionId;
