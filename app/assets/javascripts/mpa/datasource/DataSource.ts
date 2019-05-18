import DataRepository from "./DataRepository";

export default abstract class DataSource {
    protected _repository: DataRepository;

    public constructor(repository: DataRepository) {
        this._repository = repository;
    }

    
}