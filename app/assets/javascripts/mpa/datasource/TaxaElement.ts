import { TaxumRank } from "./TaxumRank";
import Element from "./Element";
import Sample from "../Sample";
import DataRepository from "./DataRepository";
import TaxaDataSource from "./TaxaDataSource";

export default class TaxaElement extends Element {
    public rank: TaxumRank;

    constructor(name: string, rank: TaxumRank, popularity: number) {
        super(name, popularity);
        this.rank = rank;
    }

    public async computeCrossPopularity(x: Element, sample: Sample): Promise<number> {
        let dataRepository: DataRepository = sample.dataRepository;
        let taxaDataSource: TaxaDataSource = await dataRepository.createTaxaDataSource();
        await taxaDataSource.getTree();
        // TODO implement
        return 0;
    }

    public async getAffectedPeptides(sample: Sample): Promise<string[]> {
        let dataRepository: DataRepository = sample.dataRepository;
        let taxaDataSource: TaxaDataSource = await dataRepository.createTaxaDataSource();
        return taxaDataSource.getAffectedPeptides(this);
    }
}