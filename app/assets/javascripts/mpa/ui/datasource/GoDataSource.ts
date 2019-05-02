import DataElement from "./DataElement";
import DataRepository from "./DataRepository";
import { GoNameSpace } from "../../../fa/GoNameSpace";
import DataSource from "./DataSource";

export default class GoDataSource extends DataSource  {
    private _namespace: GoNameSpace;

    public async getTopItems(n: number, namespace: GoNameSpace): Promise<DataElement[]> {
        return null;
    }
}
