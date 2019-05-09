export default class FAElement {
    public code: string;
    // The name associated with this GO-term code.
    public name: string;
    // Determines the amount of peptides to which this GO-term is assigned.
    public popularity: number;
    // How many of the total amount of peptides is associated with this GO-term?
    public fractionOfPepts: number;

    constructor(code: string, name: string, popularity: number, fractionOfPepts: number) {
        this.code = code;
        this.name = name;
        this.popularity = popularity;
        this.fractionOfPepts = fractionOfPepts;
    }
}