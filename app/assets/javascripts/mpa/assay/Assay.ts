import DataRepository from "../datasource/DataRepository";

export abstract class Assay
{
    private _id: string;
    private _name: string;
    private _date: Date;

    private _dataRepository: DataRepository;

    constructor(id: string, name: string = undefined, date: Date = undefined)
    {
        this._id = id;
        this._name = name;
        this._date = date;
    }

    get id()
    {
        return this._id;
    }

    get name()
    {
        return this._name;
    }

    get date()
    {
        return this._date;
    }

    get dataRepository()
    {
        return this._dataRepository;
    }

    abstract async initDataRepository();
}