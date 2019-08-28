import Sample from "../Sample";

export default abstract class Element {
    // The name associated with this element
    public name: string;
    // Determines the amount of peptides to which this element is assigned.
    public popularity: number;

    constructor(name: string, popularity: number) {
        this.name = name;
        this.popularity = popularity;
    }

    public abstract async computeCrossPopularity(x: Element, sample: Sample): Promise<number>;
    public abstract async getAffectedPeptides(sample: Sample): Promise<string[]>;
}
