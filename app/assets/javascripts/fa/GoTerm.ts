import { GoNameSpace } from "./GoNameSpace";
import FAElement from "./FAElement";

export default class GoTerm extends FAElement {
    // The GO-namespace associated with this code. Must be a valid namespace!
    public namespace: GoNameSpace;

    constructor(code: string, name: string, namespace: GoNameSpace, popularity: number, fractionOfPepts: number) {
        super(code, name, popularity, fractionOfPepts);
        this.namespace = namespace; 
    }
}