import { GroupedFA } from "../fa/FunctionalAnnotations";
import { GoInfo } from "./GoInfo";
import { postJSON } from "../utils";

export default class NewGoTerms extends GroupedFA {
    // TODO find out type of Map here
    private goData: Map<any, any> = new Map();
    private static readonly BATCH_SIZE = 1000;

    /**
     * Construct a new GoTerms. Use the factory methods to create a new GoTerms object.
     * 
     * @param data 
     * @param trust 
     */
    // private constructor(data, trust) {
    //     // super("GO terms", data, t => this.namespaceOf(t, null), trust);
    // }

    /**
     *
     * @param {Object<string,GOInfo[]>} results
     * @param {Object<string,FATrustInfo>} trust
     * @return Go term overview of the data
     */
    public static make(results, trust): NewGoTerms {
        return null;
        // const d = {};
        // for (const ns of NAMESPACES) {
        //     const nsData = results[ns] || [];
        //     GOTerms._addData(nsData, ns);
        //     d[ns] = new SingleFA(ns, nsData, trust === null ? null : trust[ns]);
        // }
        // return new GOTerms(d, null);
    }

//      /**
//      *
//      * @param {Object<String,any[]>} results
//      * @param {Object<String,FATrustInfo>} trust
//      * @return {Promise<GOTerms>} Go term overview of the data
//      */
//     public static async makeAssured(results, trust) {
//         const obj = NewGoTerms.make(results, trust);
//         await obj.assureData();
//         return obj;
//     }

//     /**
//     * @param code
//     * @param fallback value to use goTerm not found
//     * @return The namespace of the given GO term
//     */
//    private namespaceOf(code: string, fallback: string = "Unknown"): string {
//        return this.staticOf(code, "namespace", fallback);
//    }

//    /**
//      * @param goTerm
//      * @param key
//      * @param fallback value to use goTerm not found
//      * @return The value of the `key` property of `goTerm`
//      */
//     private staticOf(goTerm: string, key: string, fallback: any): any {
//         if (this.goData.has(goTerm)) {
//             return this.goData.get(goTerm)[key];
//         }
//         return fallback;
//     }

//     /**
//      * Fetch the names and data of the GO terms that are not yet in the static map of names
//      * @param codes array of GO terms that should be in the cache
//      */
//     private async fetch(codes: string[]) {
//         const todo = codes.filter(c => !this.goData.has(c));
//         if (todo.length > 0) {
//             for (let i = 0; i < todo.length; i += NewGoTerms.BATCH_SIZE) {
//                 const res = await postJSON("/private_api/goterms", JSON.stringify({
//                     goterms: todo.slice(i, i + NewGoTerms.BATCH_SIZE)
//                 }));
//                 this.addData(res);
//             }
//         }
//     }

//     /**
//      * Add GO terms to the global map
//      * 
//      * @param newTerms list of new GO terms
//      * @param namespace to use if not given
//      */
//     private addData(newTerms: GoInfo[], namespace: string = null): void {
//         newTerms.forEach(go => {
//             if (!this.goData.has(go.code) && (namespace != null || go.namespace) && go.name) {
//                 this.goData.set(go.code, {
//                     name: go.name,
//                     namespace: go.namespace || namespace,
//                     code: go.code,
//                 });
//             }
//         });
//     }

//     /**
//      * Ensure that all data is availible
//      */
//     private async assureData() {
//         await this.fetch([...this].map(x => x.code));
//     }
}
