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

    public async getAffectedPeptides(sample: Sample): Promise<string[]> {
        return this.affectedPeptides;
    }
}