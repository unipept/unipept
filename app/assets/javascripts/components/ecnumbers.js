import PriorityQueue from "../utilities/PriorityQueue.js";
import {postJSON} from "../utils.js";
/**
 * @typedef {Object} FACounts
 * @property {number} value count
 * @property {string} name  The name of the GO/EC number
 * @property {string} code  The code of the GO/EC number
 */

// const for private methods
const addMissing = Symbol("[addMissing]");
const addNames = Symbol("[addNames]");
const addMissingNames = Symbol("[addMissingNames]");
const artificial = Symbol("artificial");
let ecNames = new Map();

/**
 * Class to contain the results of a fetch of EC numbers.
 *
 * - fetch information about missing numbers in hierarchy
 * - Create a treeview
 *
 * The names associated with EC numbers are stored statically to prevent
 * useless queries
 */
export default class ECNumbers {
    /**
     * Creates a summary of given EC numbers and their counts
     * @param  {[FACounts]} ec list of EC numbers with their counts
     */
    constructor({numAnnotatedPeptides = null, data}) {
        this.numTotalSet = numAnnotatedPeptides;
        this.data = Array.from(data).sort((a, b) => (b.value - a.value));
        this.ec = new this[addMissing](data);
        ECNumbers[addNames](data);

        // Fetch names in the background, not needed yet
        setTimeout(()=>{
            ECNumbers[addMissingNames](Array.from(this.ec.keys()));
        }, 0);
    }

    /**
     * Returns the originality supplied set of EC numbers
     * sorted by value
     * @return {[FACounts]} EC number values
     */
    sortedTerms() {
        return this.data;
    }

    /**
     * Create a map width all EC numbers given and their ancestors even if they
     * are not given.
     * @param {[FACounts]} newEC list of new EC data
     * @param {Map} map map to start form
     * @return {Map}
     * @access private
     */
    [addMissing](newEC, map = null) {
        let result = (map === null ? new Map(newEC.map(x=>[x.code, x])) : map);

        for (let curEc of newEC) {
            const parts = curEc.code.split(".");
            const numSpecific = parts.includes("-") ? parts.indexOf("-") : parts.length;
            result.set(curEc.code, curEc); // overrides if exists

            for (let i = numSpecific-1; i>=1; i--) {
                parts[i] = "-";
                const newKey = parts.join(".");
                if (!result.has(newKey)) {
                    let parentEC = {code: newKey, name: null, value: 0};
                    parentEC[artificial] = true;
                    result.set(newKey, parentEC);
                } else {
                    break;// the key already exists (all following already done)
                }
            }
        }
        return result;
    }

    /**
     * Gets the value of the EC number
     *
     * @param  {string} ecNum The code of the EC number (like "2.3.-.-")
     * @return {number}       The value of the EC number
     */
    getValueOf(ecNum) {
        return this.ec.get(ecNum).value || 0;
    }

    /**
     * Gets the value of the EC number as fraction of the number of
     * the number of annotated peptides
     *
     * @param  {string} ecNum The code of the EC number (like "2.3.-.-")
     * @return {string}       The name of the EC number
     */
    getFractionOf(ecNum) {
        return this.getValueOf(ecNum) / this.numTotalSet;
    }

    /**
     * Number of annotated peptides
     *
     * @return {number}       Number of annotated peptides
     */
    getTotalSetSize() {
        return this.numTotalSet;
    }

    /**
     * Create an EC tree
     *
     * The numbers are first sorted form general to specific (number of - at the
     * end). Then the tree is built by adding the count to all ancestors.
     *
     * @param {string} target the element to put the tree in (will be cleared)
     * @param {object} treeViewOptions options to pass to the treeview
     * @return {TreeView} the created tree
     */
    createTree(target, treeViewOptions) {
        // We need one level expansion to be able to nicely expand it
        treeViewOptions["levelsToExpand"] = treeViewOptions["levelsToExpand"] || 1;

        /* Function to create a comparable string from EC numbers*/
        const makeId = code =>{
            // Pad each part with zeros so we can sort alphabetically
            // (there are EC number with letters)
            const values = code.split(".").map(x => ("0000"+x).slice(-4));
            return values.join(".");
        };

        let map = Object.create(null);

        let rootData = {id: 0,
            name: "-",
            fullname: "Enzyme Commission numbers",
            children: [],
            data: {self_count: 0},
        };

        map["-"] = rootData;

        // Sort from general to specific
        const sortedEC = Array.from(this.ec.values()).sort((a, b) => (a.code+".-").split(".").indexOf("-") - (b.code+".-").split(".").indexOf("-"));

        for (let data of sortedEC) {
            let {code, value: count, name} = data;
            const tmpPath = code.split(".").filter(x => x!=="-");
            const shortCode = tmpPath.join("."); // "-" at end are now removed

            let path = new Array(tmpPath.length);
            // "3.1.15.24" => ["3.1.15", "3.1", "3", "-"]
            for (let i = tmpPath.length; i>0; i--) {
                path[tmpPath.length-i] = tmpPath.slice(0, i-1).join(".");
            }
            path[tmpPath.length-1] = "-";

            // Create a node for the new EC-code and place it in the map
            let toInsert = {
                id: makeId(shortCode),
                name: shortCode, fullname: name,
                children: [],
                data: {self_count: count, count: count, data: data},
            };

            map[shortCode] = toInsert;
            // visit ancestors: ["3.1.15", "3.1", "3", "-"]
            // and iteratively add `toInsert` as a child of its parent
            map[path[0]].children.push(toInsert);
            for (let c of path) {
                map[c].data.count += toInsert.data.count;
            }
        }

        // Order the nodes by their id (order by EC number)
        Object.values(map).forEach(obj => obj.children.sort((a, b) => a.id.localeCompare(b.id)));

        let tree= $(target).empty().treeview(rootData, treeViewOptions);

        // expand certain nodes
        // iteratively open the leaf with the largest count
        let root = tree.getRoot();
        let allowedCount = root.data.count*2;
        let pq = new PriorityQueue((a, b) => b.data.count - a.data.count);
        root.children.forEach(c => pq.add(c));
        while (allowedCount > 0) {
            let toExpand = pq.remove();
            allowedCount -= toExpand.data.count;
            toExpand.expand(1);
            (toExpand.children || []).forEach(c => pq.add(c));
        }
        tree.update(root);

        // HACK: place the tree more to the left so everything is visible (after one second because there is a 750 ms delay)
        setTimeout(()=>d3.select(target+">svg>g>g").attr("transform", `translate(85,${(treeViewOptions.height || 600) / 2})`), 1000);
        return tree;
    }


    /**
     * Gets the name of associated with an EC number
     *
     * @param  {string} ecNum The code of the EC number (like "2.3.-.-")
     * @return {string}       The name of the EC number
     */
    static nameOf(ecNum) {
        if (ecNames.has(ecNum)) {
            return ecNames.get(ecNum);
        }
        if (ecNum == "-.-.-.-") {
            return "Enzyme Commission Numbers";
        }
        return "Unknown";
    }

    /**
     * Gets a list of ancestors of a given EC number.
     *
     * "2.1.3.-" would give ["2.1.-.-","2.-.-.-"]
     *
     * @param  {string} ecNum The code of the EC number
     * @return {[string]}  Ancestors of the EC number (from specific to generic)
     */
    static ancestorsOf(ecNum) {
        let result = [];
        let parts = ecNum.split(".");
        const numSpecific = parts.includes("-") ? parts.indexOf("-") : parts.length;

        for (let i = numSpecific-1; i>=1; i--) {
            parts[i] = "-";
            result.push(parts.join("."));
        }
        return result;
    }

    /**
     * Add EC data to the static internal map
     * @param {[FACounts]} newEC list of new ec
     * @access private
     */
    static [addNames](newEC) {
        newEC.forEach(ec => {
            if (!ecNames.has(ec.code)) {
                ecNames.set(ec.code, ec.name);
            }
        });
    }

    /**
     * Fetch the names of the EC numbers that are not yet in the static map of
     * names
     * @param {[string]} codes array of EC numbers that should be in the cache
     * @access private
     */
    static async [addMissingNames](codes) {
        let todo = codes.filter(c => !ecNames.has(c));
        let res = await postJSON("/info/ecnumbers", JSON.stringify({ecnumbers: todo}));
        ECNumbers[addNames](res);
    }
}
