import FAElement from "./FAElement";
import { EcNameSpace } from "./EcNameSpace";

export default class EcNumber extends FAElement {
    public namespace: EcNameSpace;

    constructor(code: string, name: string, namespace: EcNameSpace, popularity: number, fractionOfPepts: number) {
        super(code, name, popularity, fractionOfPepts);
        this.namespace = namespace;
    }
}
