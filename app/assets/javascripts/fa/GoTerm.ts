import { GoNameSpace } from "./GoNameSpace";
import FAElement from "./FAElement";
import Sample from "../mpa/Sample";
import DataRepository from "../mpa/datasource/DataRepository";
import GoDataSource from "../mpa/datasource/GoDataSource";
import Element from "../mpa/datasource/Element";

export default class GoTerm extends FAElement {
    // The GO-namespace associated with this code. Must be a valid namespace!
    public namespace: GoNameSpace;

    constructor(code: string, name: string, namespace: GoNameSpace, popularity: number, fractionOfPepts: number, affectedPeptides: string[]) {
        super(code, name, popularity, fractionOfPepts, affectedPeptides);
        this.namespace = namespace; 
    }

    public async computeCrossPopularity(x: Element, sample: Sample): Promise<number> {
        let dataRepository: DataRepository = sample.dataRepository;
        return 0;
    }
}