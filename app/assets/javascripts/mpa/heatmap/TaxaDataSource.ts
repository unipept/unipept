import DataSource from "./DataSource";
import DataElement from "./DataElement";

export default class TaxaDataSource implements DataSource {
    getTopItems(): DataElement[] {
        throw new Error("Method not implemented.");
    }
}
