import DataSource from "./DataSource";
import DataElement from "./DataElement";
import DataRepository from "./DataRepository";

export default class GoDataSource extends DataSource {
    private _namespace: "cellular component"|"biological process"|"molecular function";

    // TODO replace string with possible types of namespaces here!
    constructor(repository: DataRepository, namespace: "cellular component"|"biological process"|"molecular function") {
        super(repository);
        this._namespace = namespace;
    }

    public async getTopItems(n: number): Promise<DataElement[]> {
        return null;
    }
}
