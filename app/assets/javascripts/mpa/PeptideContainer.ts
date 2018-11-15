class PeptideContainer {
    private id: number;
    private peptides: string[];
    private name: string;
    private peptideAmount: number;
    private date: Date;
    private type: string;

    constructor(id: number, name: string, peptideAmount: number, date: Date, type: string) {
        this.id = id;
        this.name = name;
        this.peptideAmount = peptideAmount;
        this.date = date;
        this.type = type;
    }
}
