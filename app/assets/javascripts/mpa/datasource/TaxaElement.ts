import { TaxumRank } from "./TaxumRank";
import Element from "./Element";

export default class TaxaElement extends Element {
    public rank: TaxumRank;

    constructor(name: string, rank: TaxumRank) {
        super(name);
        this.rank = rank;
    }
}