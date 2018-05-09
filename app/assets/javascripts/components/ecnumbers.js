import {postJSON} from "../utils.js";
/**
 * @typedef {Object} FACounts
 * @property {number} value count
 * @property {string} name  The name of the GO/EC number
 * @property {string} code  The code of the GO/EC number
 */

const BATCH_SIZE = 1000;

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
     * Static cache of fetched EC names
     * @access private
     */
    static ecNames = new Map([["-.-.-.-", "Enzyme Commission Numbers"]]);

    /**
     * Creates a summary of given EC numbers and their counts
     * @param  {[FACounts]} ec list of EC numbers with their counts
     * @param {bool} [ensureData=true] fetch names for this resultset in the background,ss
     *                                 if false, you must call `ensureData()` on this object.
     * @param {bool} [clone=false] *for internal use*
     */
    constructor({numAnnotatedProteins = null, data = []}, ensureData = true, clone = false) {
        if (clone) return;
        this.numTotalSet = numAnnotatedProteins;
        this.data = Array.from(data).sort((a, b) => (b.value - a.value));
        this.ec = new this.addMissing(data);
        ECNumbers.addNames(data);

        // Fetch names in the background, not needed yet
        if (ensureData) {
            this.ensureData();
        }
    }

    /**
     * Make a new ECNumbers form a clone
     * @param {ECNumbers} other
     * @param {ECNumbers} [base=null] optional ECNumbers instance to reuse
     * @return {ECNumbers} filled ECNumbers instance
     */
    static clone(other, base = null) {
        let ec = base;
        if (base === null) {
            ec = new ECNumbers({}, true, true);
        }
        ec.numTotalSet = other.numTotalSet;
        ec.data = other.data;
        ec.ec = other.ec;
        return ec;
    }

    /**
     * Fetch the names of the GO terms and await them
     */
    async ensureData() {
        await ECNumbers.addMissingNames(Array.from(this.ec.keys()));
    }

    /**
     * Returns the originally supplied set of EC numbers
     * sorted by value
     * @return {[FACounts]} Sorted EC number
     */
    sortedTerms() {
        return this.data;
    }

    /**
     * Create a map width all EC numbers given and their ancestors even if they
     * are not given.
     * @param {[FACounts]} newEC list of new EC data
     * @return {Map}
     * @access private
     */
    addMissing(newEC) {
        const result = new Map([...newEC].map(x => [x.code, x]));

        for (const curEc of newEC) {
            const parts = curEc.code.split(".");
            const numSpecific = parts.includes("-") ? parts.indexOf("-") : parts.length;
            result.set(curEc.code, curEc); // overrides if exists

            for (let i = numSpecific - 1; i >= 1; i--) {
                parts[i] = "-";
                const newKey = parts.join(".");
                if (!result.has(newKey)) {
                    const parentEC = {code: newKey, name: null, value: 0};
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
        if (this.ec.has(ecNum)) {
            return this.ec.get(ecNum).value || 0;
        }
        return 0;
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
     * Make a tree structure of the EC numbers in the resultset
     *
     * @access private
     * @return {Node} a treeview data model
     */
    treeData() {
        const map = Object.create(null);

        // The root node
        map["-.-.-.-"] = {id: 0, name: "-.-.-.-", children: [], data: {self_count: 0, count: 0}};

        // Sort from general to specific
        const sortedEC = Array.from(this.ec.values())
            .sort((a, b) => ECNumbers.levelOf(a.code) - ECNumbers.levelOf(b.code));

        for (const data of sortedEC) {
            const {code, value: count} = data;

            // Create a node for the new EC-code and place it in the map
            const toInsert = {
                id: code.split(".").map(x => ("0000" + x).slice(-4)).join("."),
                name: code.split(".").filter(x => x !== "-").join("."),
                children: [],
                data: {self_count: count, count: count, data: data},
            };

            map[code] = toInsert;

            const ancestors = ECNumbers.ancestorsOf(code, true);
            map[ancestors[0]].children.push(toInsert);
            for (const a of ancestors) {
                map[a].data.count += toInsert.data.count;
            }
        }

        // Order the nodes by their id (order by EC number)
        Object.values(map).forEach(obj => obj.children.sort((a, b) => a.id.localeCompare(b.id)));
        return map["-.-.-.-"]; // the root node
    }

    /**
     * Gets the name of associated with an EC number
     *
     * @param  {string} ecNum The code of the EC number (like "2.3.-.-")
     * @return {string}       The name of the EC number
     */
    static nameOf(ecNum) {
        if (this.ecNames.has(ecNum)) {
            return this.ecNames.get(ecNum);
        }
        return "Unknown";
    }

    /**
     * Gets a list of ancestors of a given EC number.
     *
     * "2.1.3.-" would give ["2.1.-.-","2.-.-.-"]
     *
     * @param  {string} ecNum The code of the EC number
     * @param {bool} [includeRoot=false] weather to include the root (-.-.-.-)
     * @return {[string]}  Ancestors of the EC number (from specific to generic)
     */
    static ancestorsOf(ecNum, includeRoot = false) {
        const result = [];
        const parts = ecNum.split(".");
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
     * Calculates how specific the EC number is as int form
     * 0 (generic) to 4 (specific). Counts the number of non "-" in
     * the ec number
     *
     * @param  {string} ecNum an EC number (form "2.1.3.-")
     * @return {int}  Ancestors of the EC number (from specific to generic)
     */
    static levelOf(ecNum) {
        return (ecNum + ".-").split(".").indexOf("-");
    }

    /**
     * Add EC data to the static internal map
     * @param {[FACounts]} newECs list of new ec
     * @access private
     */
    static addNames(newECs) {
        for (let ec of newECs) {
            if (!this.ecNames.has(ec.code) && ec.name) {
                this.ecNames.set(ec.code, ec.name);
            }
        }
    }

    /**
     * Cone the ECNumbers information into the current ECNumbers static value
     *
     * Needed to work properly with WebWorkers that do not share these statics
     *
     * @param {iteratable<FAInfo>} names inforamtion about GO Terms
     */
    static ingestNames(names) {
        ECNumbers.ecNames = names;
    }

    /**
     * Fetch the names and data of the EC numbers that are not yet in the static map of
     * names
     * @param {[string]} codes array of EC numbers that should be in the cache
     * @access private
     */
    static async addMissingNames(codes) {
        const todo = codes.filter(c => !this.ecNames.has(c));
        if (todo.length > 0) {
            for (let i = 0; i < todo.length; i += BATCH_SIZE) {
                const res = await postJSON("/private_api/ecnumbers", JSON.stringify({
                    ecnumbers: todo.slice(i, i + BATCH_SIZE),
                }));
                ECNumbers.addNames(res);
            }
        }
    }
}
