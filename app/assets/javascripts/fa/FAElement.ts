import Element from "../mpa/datasource/Element";
import Sample from "../mpa/Sample";

export default abstract class FAElement extends Element {
    public code: string;
    // How many of the total amount of peptides is associated with this GO-term?
    public fractionOfPepts: number;
    public affectedPeptides: string[];

    constructor(code: string, name: string, popularity: number, fractionOfPepts: number, affectedPeptides: string[]) {
        super(name, popularity);
        this.code = code;
        this.popularity = popularity;
        this.fractionOfPepts = fractionOfPepts;
        this.affectedPeptides = affectedPeptides;
    }
    
    public async computeCrossPopularity(x: Element, sample: Sample): Promise<number> {
        // We need to count how many of the affected peptides of the element x are also annotated with this GO-term.
        let otherAffectedPeptides: string[] = await x.getAffectedPeptides(sample);
        // Count how many items from x's affected peptides are also part of these affected peptides.
        // TODO If we are certain that all affected peptides are always sorted, we can implement a more efficient 
        // approach to this problem
        return otherAffectedPeptides.reduce((acc: number, current: string) => this.affectedPeptides.includes(current) ? 1 : 0, 0);
    }

    public async getAffectedPeptides(sample: Sample): Promise<string[]> {
        return this.affectedPeptides;
    }
}