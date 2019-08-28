export default class SampleDataset {
    public id: string;
    public environment: string;
    public projectWebsite: string;
    public reference: string;
    public url: string;
    public datasets: string[][];

    constructor(id: string, environment: string, projectWebsite: string, reference: string, url: string, datasets) {
        this.id = id;
        this.environment = environment;
        this.projectWebsite = projectWebsite;
        this.reference = reference;
        this.url = url;
        this.datasets = datasets;
    }
}
