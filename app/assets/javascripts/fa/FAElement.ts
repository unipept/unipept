import Element from "../mpa/datasource/Element";

export default class FAElement extends Element {
    public code: string;
    // Determines the amount of peptides to which this GO-term is assigned.
    public popularity: number;
    // How many of the total amount of peptides is associated with this GO-term?
    public fractionOfPepts: number;

    constructor(code: string, name: string, popularity: number, fractionOfPepts: number) {
        super(name);
        this.code = code;
        this.popularity = popularity;
        this.fractionOfPepts = fractionOfPepts;
    }
}