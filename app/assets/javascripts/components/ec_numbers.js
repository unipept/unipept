import PriorityQueue from "../utilities/PriorityQueue.js";

/**
 * @typedef {Object} FACounts
 * @property {number} value count
 * @property {string} name  The name of the GO/EC nummber
 * @property {string} code  The code of the GO/EC nummber
 */


const addMissing = Symbol("[addMissing]");
const addNames = Symbol("[addNames]");
const addMissingNames = Symbol("[addMissingNames]");
const atrificial = Symbol("atrificial");
let ecNames = new Map();
/**
 * Class that helps organising EC numbers
 * - fetch information about missing numbers in hyrarchy
 * - Create a treeview
 */
export default class ECNumbers {
    /**
     * Creares a new ECNumbers
     * @param  {[FACounts]} ec list of EC numbers with their counts
     */
    constructor(ec) {
        this.ec = new this[addMissing](ec);
        ECNumbers[addNames](ec);

        // Fetch names in the background, not needed yet
        setTimeout(()=>{
            ECNumbers[addMissingNames](Array.from(this.ec.keys()));
        }, 0);
    }

    /**
     * Create a map with all EC numbers given and their ancestors even if they
     * are not given.
     * @param {[FACounts]} newEC list of new ec
     * @param {Map} map ldld
     * @return {Map}
     */
    [addMissing](newEC, map = null) {
        let result = (map === null ? new Map(newEC.map(x=>[x.code, x])) : map);

        for (let curEc of newEC) {
            const parts = curEc.code.split(".");
            const numSpecific = parts.includes("-") ? parts.indexOf("-") : parts.length;
            result.set(curEc.code, curEc); // overides if exists

            for (let i = numSpecific-1; i>=1; i--) {
                parts[i] = "-";
                const newKey = parts.join(".");
                if (!result.has(newKey)) {
                    let parentEC = {code: newKey, name: null, value: 0};
                    parentEC[atrificial] = true;
                    result.set(newKey, parentEC);
                } else {
                    break;// the key already exists (all folowing already done)
                }
            }
        }
        return result;
    }

    /**
     * Create a map with all EC numbers given and their ancestors even if they
     * are not given.
     * @param {[FACounts]} newEC list of new ec
     * @param {Map} map ldld
     */
    static [addNames](newEC) {
        newEC.forEach(ec => {
            if (!ecNames.has(ec.code)) {
                ecNames.set(ec.code, ec.name);
            }
        });
    }

    /**
     * Create a map with all EC numbers given and their ancestors even if they
     * are not given.
     * @param {[string]} codes array of ec codes that should be in the cache
     * @param {Map} map ldld
     */
    static async [addMissingNames](codes) {
        let todo = codes.filter(c => !ecNames.has(c));
        let res = await ECNumbers.postJSON("/info/ecnumbers", JSON.stringify({ecnumbers: todo}));
        ECNumbers[addNames](res);
    }


    /**
     * Posts data to a url as json and returns a promise containing the parsed
     * (json) response
     *
     * @param  {string} url The url to which we want to send the request
     * @param  {string} data The data to post in JSON format
     * @return {Promise} A Promise containing the parsed response data
     * @todo remove
     */
    static postJSON(url, data) {
        return fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: data,
        }).then(res => res.json());
    }

    /**
     * Create an EC tree
     *
     * The numbers are first dorted form general to specific (number of - at the
     * end). Then the tree is built by adding the count to all ancestors.
     *
     * @param {string} target the element to put the tree in (will be cleared)
     * @param {object} treeViewOptions options to pass to the treeview
     * @return {TreeView} the created tree
     */
    createTree(target, treeViewOptions) {
        /* Function to create a compareable string from EC numbers*/
        const makeId = code =>{
            // Pad each part with zeros so we can sort alphabeticly
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

        // HACK: place the tree more to the left so everything is visible
        setTimeout(()=>d3.select("#ec-treeview>svg>g>g").attr("transform", `translate(85,${(treeViewOptions.height || 600) / 2})`), 1000);
        return tree;
    }


    /**
     * Gets the name of associated with an EC number and requests it if needed
     *
     * @param  {string} ecNum The code of the EC number
     * @return {string}       The name of the EC number
     */
    static nameOf(ecNum) {
        if (ecNames.has(ecNum)) {
            return ecNames.get(ecNum);
        }
        return "Unknown";
    }

    /**
     * Gets the name of associated with an EC number and requests it if needed
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
}
