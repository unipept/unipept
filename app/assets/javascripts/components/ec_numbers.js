import PriorityQueue from "../utilities/PriorityQueue.js";

/**
 * @typedef {Object} FACounts
 * @property {number} value count
 * @property {string} name  The name of the GO/EC nummber
 * @property {string} code  The code of the GO/EC nummber
 */


const addMissing = Symbol("[addMissing]");
const atrificial = Symbol("atrificial");

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
     * Create an EC tree
     */
    createTree() {
        let numAnnotatedPeptides = 1;
        /* Function to create a compareable string from EC numbers*/
        let makeId = code =>{
            // Pad each part with zeros so we can sort alphabeticly
            // (there are EC number with letters)
            const values = code.split(".").map(x => ("0000"+x).slice(-4));
            return values.join(".");
        };

        // A map to store pointers to places in the tree that have already been
        // created (non changing so we use object)
        let map = Object.create(null);

        // We make a root node, and add it to the map
        let results = {id: 0,
            name: "-",
            fullname: "Enzyme Commission numbers",
            children: [],
            data: {self_count: 0},
        };

        map["-"] = results;

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
            let placed = false;
            let toInsert = {
                id: makeId(shortCode),
                name: shortCode,
                fullname: name,
                children: [],
                data: {self_count: count, count: count, data: data},
            };

            map[shortCode] = toInsert;
            // visit ancestors: ["3.1.15", "3.1", "3", "-"]
            // and iteratively add `toInsert` as a child of its parent
            for (let c of path) {
                if (!placed) map[c].children.push(toInsert);
                map[c].data.count += toInsert.data.count;
                placed = true;
            }
        }

        // Order the nodes by their id (order by EC number)
        Object.values(map).forEach(obj => obj.children.sort((a, b) => a.id.localeCompare(b.id)));

        // Finally create tree
        let tree= $("#ec-treeview").empty().treeview(results, {
            width: 916,
            height: 600,
            levelsToExpand: 1,
            getTooltip: d => {
                let fullcode = "EC:"+ (d.name + ".-.-.-.-").split(".").splice(0, 4).join(".");
                let tip = `<strong>${fullcode}</strong>`;
                if ("data" in d.data) {
                    tip += `<br>${d.data.data.name}`;
                }
                tip += `<br>ocurrences: ${d.data.count} (${(100*d.data.count/numAnnotatedPeptides).toFixed(1)}%) <br>`;
                if (d.data.count == d.data.self_count) {
                    tip += "All specific";
                } else {
                    tip += `Specific ocurrences: ${d.data.self_count} (${(100*d.data.self_count/numAnnotatedPeptides).toFixed(1)}%)`;
                }
                return tip;
            },
        });

        // expand certain nodes
        // iteratively open the leaf with the largest count
        // TODO: move to somewhere else
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
        setTimeout(()=>d3.select("#ec-treeview>svg>g>g").attr("transform", "translate(85,295)"), 1000);
    }
}
