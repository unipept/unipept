import DataRepository from "../datasource/DataRepository";
import Visitable from "../visitors/Visitable";
import Visitor from "../visitors/Visitor";
import { StorageType } from "../StorageType";

export abstract class Assay implements Visitable
{
    private _id: string;
    private _storageType: StorageType;
    private _dataRepository: DataRepository;

    public name: string;
    public date: Date;

    constructor(id: string, storageType: StorageType, name: string = undefined, date: Date = undefined)
    {
        this._id = id;
        this.name = name;
        this.date = date;
        this._storageType = storageType;
    }

    get id()
    {
        return this._id;
    }

    get storageType()
    {
        return this._storageType;
    }

    get dataRepository()
    {
        return this._dataRepository;
    }

    getDateFormatted(): string 
    {
        // @ts-ignore
        return this.date.getFullYear() + "/" + (this.date.getMonth() + 1).toString().padStart(2, '0') + "/" + this.date.getDate().toString().padStart(2, '0');
    }

    abstract async initDataRepository(mpaConfig: MPAConfig);
    abstract async visit(visitor: Visitor): Promise<void>;
}