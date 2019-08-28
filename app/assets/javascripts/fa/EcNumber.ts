import FAElement from "./FAElement";
import { EcNameSpace } from "./EcNameSpace";

export default class EcNumber extends FAElement {
    public namespace: EcNameSpace;

    /**
     * Construct a new EcNumber.
     * 
     * @param code The code that uniquely identifies this EC-number. This code should not include the "EC:"-prefix! 
     * @param name The name that's associated with the given EC-code.
     * @param namespace The namespace that's associated with the given EC-code.
     * @param popularity The amount of peptides that's associated with this EC-number in the associated sample.
     * @param fractionOfPepts The fraction of the total amount of peptides that's associated with this EC-number.
     */
    constructor(code: string, name: string, namespace: EcNameSpace, popularity: number, fractionOfPepts: number, affectedPeptides: string[]) {
        super(code, name, popularity, fractionOfPepts, affectedPeptides);
        this.namespace = namespace;
    }

    public get ancestors(): string[] {
        return EcNumber.computeAncestors(this.code);
    }

    /**
     * Gets a list of ancestors of a given EC number. E.g. "2.1.3.-" would give ["2.1.-.-", "2.-.-.-"]
     *
     * @param code The EC-code for which all ancestors need to be computed.
     * @param includeRoot Whether to include the root (-.-.-.-).
     * @return Ancestors of the EC number (from specific to generic).
     */
    public static computeAncestors(code: string, includeRoot: boolean = false): string[] {
        const result = [];
        const parts = code.split(".");
        const numSpecific = parts.includes("-") ? parts.indexOf("-") : parts.length;

        for (let i = numSpecific - 1; i >= 1; i--) {
            parts[i] = "-";
            result.push(parts.join("."));
        }

        if (includeRoot) {
            result.push("-.-.-.-");
        }
        
        return result;
    }

    /**
     * Calculates how specific the EC-number is as int form 0 (generic) to 4 (specific). Counts the number of non "-" in
     * this EC-number.
     *
     * @return {number}  Level of this EC-number.
     */
    public get level(): number {
        return EcNumber.computeLevel(this.code);
    }

    public static computeLevel(code: string): number {
        return (code + ".-").split(".").indexOf("-");
    }
}
