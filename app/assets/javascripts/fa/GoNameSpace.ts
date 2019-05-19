export enum GoNameSpace {
    CellularComponent = "cellular component",
    MolecularFunction = "molecular function",
    BiologicalProcess = "biological process"
}

export function convertStringToGoNameSpace(input: string): GoNameSpace {
    input = input.toLowerCase();
    for (let space of Object.values(GoNameSpace)) {
        if (space === input) {
            return space;
        }
    }
    return null;
}
