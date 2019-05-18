export enum EcNameSpace {
    // EC 1.x.x.x class
    Oxidoreductases = "oxidoreductases",
    // EC 2.x.x.x class
    Transferases = "transferases",
    // EC 3.x.x.x class
    Hydrolases = "hydrolases",
    // EC 4.x.x.x class
    Lyases = "lyases",
    // EC 5.x.x.x class
    Isomerases = "isomerases",
    // EC 6.x.x.x class
    Ligases = "ligases",
    // EC 7.x.x.x class
    Translocases = "translocases"
}

/**
 * Converts a code in the form "EC:x.x.x.x" to the corresponding EcNameSpace.
 * 
 * @param code The EC-Number for which the namespace should be computed.
 */
export function convertEcNumberToEcNameSpace(code: string): EcNameSpace {
    return Object.values(EcNameSpace)[parseInt(code.substr(0, 1)) - 1];
}

export function convertStringToEcNameSpace(ns: string): EcNameSpace {
    for (let space of Object.values(EcNameSpace)) {
        if (ns === space) {
            return space;
        }
    }
    return null;
}
