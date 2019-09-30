export type PeptideData = 
{
    lca: number, 
    lineage: [number], 
    fa: 
    {
        counts: 
        {
            all: number,
            EC: number;
            GO: number;
        },
        data: any
    }
}

type Response = Map<string, PeptideData>;

export class pept2dataResponse
{
    private _response: Response;

    constructor(response: Response = new Map<string, PeptideData>())
    {
        this._response = response;
    }

    setPeptideData(peptide: string, peptideData: PeptideData)
    {
        this._response.set(peptide, peptideData);
    }

    GetPeptideData(peptide: string) : Readonly<PeptideData>
    {
        return this._response.get(peptide);
    }

    HasPeptide(peptide: string) : boolean
    {
        return this._response.has(peptide);
    }

    GetResponse() : Readonly<Response>
    {
        return this._response;
    }
}