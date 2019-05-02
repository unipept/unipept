import DataRepository from "./DataRepository";

export default class DataSource {
    protected _repository: DataRepository;

    public constructor(repository: DataRepository) {
        this._repository = repository;
    }
}