import DataSource from "./DataSource";
import DataElement from "./DataElement";

export default class GoDataSource implements DataSource {
    getTopItems(): DataElement[] {
        throw new Error("Method not implemented.");
    }
}
