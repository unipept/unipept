import DataRepository from "../datasource/DataRepository";
import Visitable from "../visitors/Visitable";
import Visitor from "../visitors/Visitor";
import { StorageType } from "../StorageType";

export default abstract class Assay implements Visitable
{
    private _id: string;
    private _name: string;
    private _date: Date;
    private _storageType: StorageType;

    protected _dataRepository: DataRepository;

    public progress: number = 0;

    constructor(id: string = undefined, storageType: StorageType = undefined, name: string = undefined, date: Date = undefined)
    {
        this._id = id;
        this._name = name;
        this._date = date;
        this._storageType = storageType;
    }

    getId()
    {
        return this._id;
    }

    setId(id: string)
    {
        this._id = id;
    }

    getName()
    {
        return this._name;
    }

    setName(name: string)
    {
        this._name = name;
    }

    getDate()
    {
        return this._date;
    }

    setDate(date: Date)
    {
        this._date = date;
    }

    getStorageType()
    {
        return this._storageType;
    }

    setStorageType(storageType: StorageType)
    {
        this._storageType = storageType;
    }

    get dataRepository()
    {
        return this._dataRepository;
    }

    getDateFormatted(): string 
    {
        // @ts-ignore
        return this._date.getFullYear() + "/" + (this._date.getMonth() + 1).toString().padStart(2, '0') + "/" + this._date.getDate().toString().padStart(2, '0');
    }

    abstract async initDataRepository(mpaConfig: MPAConfig);
    abstract async visit(visitor: Visitor): Promise<void>;
}