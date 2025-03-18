export default interface Protein {
    id: string,
    name: string,
    databaseType: string,
    taxonId: number,
    ecReferences: string[],
    goReferences: string[],
    interproReferences: string[]
}
