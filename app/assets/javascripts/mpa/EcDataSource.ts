import DataSource from "./DataSource";
import DataElement from "./DataElement";

export default class EcDataSource extends DataSource {
    public async getTopItems(n: number): Promise<DataElement[]> {
        throw new Error("Method not implemented.");
    }
}
