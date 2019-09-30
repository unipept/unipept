export interface NCBITaxon
{
    id: number,
    name: string,
    rank: string,
    lineage: [number]
}