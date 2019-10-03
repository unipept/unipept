export default class PeptideContainer 
{
    private _peptides: string[];
    private _peptideAmount: number;

    /**
     * Create a new PeptideContainer. A PeptideContainer is actually a representation of a dataset that can be
     * serialized to local storage.
     *
     * @param id A unique id associated with this dataset.
     */
    constructor(peptides: string[] = []) 
    {
        this._peptides = peptides;
        this._peptideAmount = peptides.length
    }

    /**
     * @returns The peptides that are stored in this container.
     */
    getPeptides(): string[]
    {
        return this._peptides;
    }
    /**
     * Update the list of peptides that belong to this dataset. Note that the amount of peptides that stored is also
     * directly updated by this function. There's no need to invoke {@link PeptideContainer#setAmountOfPeptides}
     * afterwards.
     *
     * @param peptides The list of peptides that forms the heart of this dataset.
     */
    setPeptides(peptides: string[]) 
    {
        this._peptides = peptides;
        this._peptideAmount = this._peptides.length;
    }

    getAmountOfPeptides(): number 
    {
        return this._peptideAmount;
    }

    setAmountOfPeptides(amount: number)
    {
        this._peptideAmount = amount;
    }
}
