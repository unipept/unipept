import { GoNameSpace } from "./GoNameSpace";

export default class GoTerm {
    public code: string;
    // The name associated with this GO-term code.
    public name: string;
    // The GO-namespace associated with this code. Must be a valid namespace!
    public namespace: GoNameSpace;
    // Determines the amount of peptides to which this GO-term is assigned.
    public popularity: number;

    constructor(code: string, name: string, namespace: GoNameSpace, popularity: number) {
        this.code = code;
        this.name = name;
        this.namespace = namespace;
        this.popularity = popularity;
    }
}