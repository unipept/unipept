// vars
var data = {},
    unicoreData = [],
    order = [],
    lca = "",
    pans = [],
    cores = [],
    unicores = [],
    unicorePresent = false,
    rank = 0,
    matrix;

// Add an event handler to the worker
self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
    case 'log':
        sendToHost("log", data.msg);
        break;
    case 'loadData':
        loadData(data.msg.bioproject_id, data.msg.name);
        break;
    case 'loadUserData':
        loadUserData(data.msg.id, data.msg.name, data.msg.ids);
        break;
    case 'removeData':
        removeData(data.msg.bioproject_id, data.msg.order, data.msg.start);
        break;
    case 'clearAllData':
        clearAllData();
        break;
    case 'recalculatePanCore':
        recalculatePanCore(data.msg.order, data.msg.start, data.msg.stop);
        break;
    case 'getUniqueSequences':
        getUniqueSequences(data.msg.order, data.msg.force);
        break;
    case 'autoSort':
        autoSort(data.msg.type);
        break;
    case "getSequences":
        getSequences(data.msg.type, data.msg.bioproject_id);
        break;
    case "calculateSimilarity":
        matrix.calculateSimilarity();
        break;
    case "clusterMatrix":
        matrix.clusterMatrix();
        break;
    case "getMatrix":
        matrix.sendToHost();
        break;
    default:
        error(data.msg);
    }
}, false);


/* Write a small class to contain all the variables for the matrix */
var matrixBackend = function matrixBackend(data) {
    var idsToCalculate = [],
        matrixOrder  = [],
        matrixObject = {};

    // variable to keep track of dirty state
    var dirty = false;

    var that = {};

    /**************************** Private methods *****************************/

    /**
     * Converts the object representation of the matrix to a normal array
     */
    function matrixObjectToArray() {
        var returnMatrix = [],
            i,
            j;
        for (i = 0; i < matrixOrder.length; i++) {
            returnMatrix[i] = [];
            for (j = 0; j < matrixOrder.length; j++) {
                returnMatrix[i][j] = matrixObject[matrixOrder[i]][matrixOrder[j]];
            }
        }
        return returnMatrix;
    }

    /**
     * Searches in tree for an occurance of x to replace that occurance by the
     * triplet [x, y, val]
     *
     * @param <Array> tree A hierarchical array representing the tree
     * @param <Number> x The first value
     * @param <Number> y The second value
     * @param <Number> val The similarity between x and y
     */
    function findAndReplace(tree, x, y, val) {
        var index;
        if (tree instanceof Array) {
            index = tree.indexOf(x);
            if (index === -1 || index === 2) {
                findAndReplace(tree[0], x, y, val);
                findAndReplace(tree[1], x, y, val);
            } else {
                tree[index] = [x, y, val];
            }
        }
    }

    /**
     * Flattens a hierarchical array based on the first 2 elements. Always
     * removes the last element. Converts the id's to bioproject id's.
     *
     * @param <Array> array The array to flatten
     */
    function treeToOrder(array) {
        var result = [],
            i;
        for (i = 0; i < array.length - 1; i++) {
            if (array[i] instanceof Array) {
                result = result.concat(treeToOrder(array[i]));
            } else {
                result.push(matrixOrder[array[i]]);
            }
        }
        return result;
    }

    /**
     * Recursively converts the clustered similarities to a valid newick string
     *
     * @param <Array> array The clustered similarities
     * @param <Number> prevDist The previous distance
     */
    function arrayToNewick(array, prevDist) {
        // default to zero
        if (prevDist === undefined) {
            prevDist = 0;
        }

        var string = "(",
            distance = array[array.length - 1],
            i;

        for (i = 0; i < array.length - 1; i++) {
            if (array[i] instanceof Array) {
                string += arrayToNewick(array[i], distance);
            } else {
                string += generateNewickName(data[matrixOrder[array[i]]]) + ":" + (1 - distance);
            }
            if (i !== array.length - 2) {
                string += ", ";
            }
        }
        string += "):" + (distance - prevDist);
        return string;
    }

    /***************************** Public methods *****************************/

    /**
     * Adds a genome to the matrix object
     *
     * @param <Number> genomeId The id of the genome to add
     */
    that.addGenome = function addGenome(genomeId) {
        var id;
        dirty = true;
        matrixOrder.push(genomeId);
        idsToCalculate.push(genomeId);

        matrixObject[genomeId] = {};
        for (id in matrixObject) {
            matrixObject[id][genomeId] = -1;
            matrixObject[genomeId][id] = -1;
        }
    };

    /**
     * Removes a genome from the matrix object
     *
     * @param <Number> genomeId The id of the genome to remove
     */
    that.removeGenome = function removeGenome(genomeId) {
        var x;

        matrixOrder.splice(matrixOrder.indexOf(genomeId), 1);
        x = idsToCalculate.indexOf(genomeId);
        if (x !== -1) {
            idsToCalculate.splice(x, 1);
        }
        delete matrixObject[genomeId];
        for (x in matrixObject) {
            delete matrixObject[x][genomeId];
        }
    };

    /**
     * Calculates all uncalculated cells in the similarity matrix
     */
    that.calculateSimilarity = function calculateSimilarity() {
        var sendFullMatrix = true,
            dataQueue = {},
            x,
            id,
            peptides,
            id2,
            similarity;

        // Be a bit clever with sending data
        if (idsToCalculate.length > 3) {
            sendFullMatrix = false;
        }

        for (x = 0; x < idsToCalculate.length; x++) {
            id = idsToCalculate[x];
            peptides = data[id].peptide_list;

            for (id2 in matrixObject) {
                similarity = genomeSimilarity(peptides, data[id2].peptide_list);
                matrixObject[id][id2] = similarity;
                matrixObject[id2][id] = similarity;
            }

            if (!sendFullMatrix) {
                dataQueue[id] = matrixObject[id];
                if (x % 3 === 2 || x === idsToCalculate.length - 1) {
                    that.sendRows(dataQueue);
                    dataQueue = {};
                }
            }
        }

        if (sendFullMatrix) {
            that.sendMatrix(matrixObject);
        }

        dirty = false;
        idsToCalculate = [];
    };

    /**
     * Sends the full similarity matrix to the client
     *
     * @param <SimObject> m The full similarity matrix to send
     */
    that.sendMatrix = function sendMatrix(m) {
        sendToHost('processSimilarityData', {'fullMatrix' : true, 'data': m});
    };

    /**
     * Sends a single row of similarities to the client
     *
     * @param <Map> dataQueue The list of id to data mappings
     */
    that.sendRows = function sendRows(dataQueue) {
        sendToHost('processSimilarityData', {'fullMatrix' : false, 'data' : dataQueue});
    };

    /**
     * Calculates the order of the clustered matrix
     */
    that.getClusteredOrder = function getClusteredOrder() {
        return treeToOrder(that.calculateTree());
    };

    /**
     * Clusters the genomes based on similarity
     */
    that.clusterMatrix = function clusterMatrix() {
        if (matrixOrder.length === 0) {
            return;
        }
        var tree = that.calculateTree();
        sendToHost('processClusteredMatrix', {
            order : treeToOrder(tree),
            newick : arrayToNewick(tree) + ";"
        });
    };

    /**
     * Clusters the matrix and returns a tree of the clustering
     */
    that.calculateTree = function calculateTree() {
        var i,
            matrixArray,
            result,
            resultOrder,
            first,
            tree,
            next;

        if (dirty) {
            that.calculateSimilarity();
        }

        // Create an array representation of the similarities object
        matrixArray = matrixObjectToArray();

        sizes = [];
        for (i = 0; i < matrixArray.length; i++) {
            sizes[i] = 1;
        }

        // Cluster the matrix
        result = clusterMatrixRecursively(matrixArray, sizes, {}, []);
        resultOrder = result.order;

        // Start building the tree
        first = resultOrder.splice(-1, 1)[0];
        tree = [first.x, first.y, first.value];
        for (i = resultOrder.length - 1; i >= 0; i--) {
            next = resultOrder[i];
            // Find next.x recursively
            findAndReplace(tree, next.x, next.y, next.value);
        }

        return tree;
    };

    /**
     * Clusters the matrix recursively
     *
     * @param <Array> matrix The array representation of the similarities
     * @param <Array> sizes The size of the clusters corresponding with the rows
     * @param <Map> cluster A mapping of which rows were combined in previous
     *      steps
     * @param <Array> order A list of objects containing the combined rows and
     *      their similarities
     */
    function clusterMatrixRecursively(matrix, sizes, cluster, order) {
        var x = 0,
            y = 0,
            largest = -1,
            i,
            j,
            temp;

        // Are we done?
        if (order.length === matrix.length - 1) {
            return {'order': order, 'cluster': cluster};
        }

        // find highest similarity
        for (i = 0; i < matrix.length; i++) {
            for (j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] > largest && i !== j) {
                    x = i;
                    y = j;
                    largest = matrix[i][j];
                }
            }
        }

        if (!cluster[x]) {
            cluster[x] = [];
        }
        cluster[x].push(y);

        order.push({'x': x, 'y': y, 'value': largest});

        // Update sim matrix with average values
        for (j = 0; j < matrix.length; j++) {
            if (j !== y && j !== x) {
                temp = (sizes[x] * matrix[x][j] + sizes[y] * matrix[y][j]) / (sizes[x] + sizes[y]);
                matrix[x][j] = temp;
                matrix[j][x] = temp;
            }
        }

        // Set the value of comparison with y to zero
        for (j = 0; j < matrix.length; j++) {
            matrix[y][j] = -1;
            matrix[j][y] = -1;
        }

        sizes[x] = sizes[x] + sizes[y];
        sizes[y] = 0;

        return clusterMatrixRecursively(matrix, sizes, cluster, order);
    }

    return that;
};
matrix = matrixBackend(data);


/**
 * Sends a response type and message to the host
 *
 * @param <String> type The type of the message
 * @param <String> message A string or Object in JSON
 */
function sendToHost(type, message) {
    self.postMessage({'type': type, 'msg': message});
}

/**
 * Requests the sequence id's for a given bioproject id. Calls the addData
 * function when done.
 *
 * @param <Number> bioproject_id The bioprojectId of the sequences we want
 * @param <String> name The name of the organism
 */
function loadData(bioproject_id, name) {
    var requestRank = rank;
    getJSON("/peptidome/sequences/" + bioproject_id + ".json", function (json_data) {
        addData(bioproject_id, name, json_data, requestRank);
    });
}

/**
 * Integrates a user-uploaded genome into the visualisation
 *
 * @params <Number> id An id
 * @params <String> name The name of the genome
 * @params <Array> ids A list of internal peptide id's
 */
function loadUserData(id, name, ids) {
    ids = JSON.parse(ids);
    addData(id, name, ids, rank);
}

/**
 * Processes a list of sequence_id's, received from the webserver and adds it
 * to the data array.
 *
 * @param <Number> bioproject_id The bioprojectId of the organism
 * @param <String> name The name of the organism
 * @param <Array> set The ordered array of sequence_id, contains no duplicates
 * @param <Number> request_rank The rank of the request. Used to discard old
 *      requests
 */
function addData(bioproject_id, name, set, request_rank) {
    var core,
        pan,
        unicore,
        temp;

    // Discard old data
    if (request_rank !== rank) return;

    // Store data for later use
    data[bioproject_id] = {};
    data[bioproject_id].bioproject_id = bioproject_id;
    data[bioproject_id].name = name;
    data[bioproject_id].peptide_list = set;
    data[bioproject_id].peptides = set.length;

    // Calculate pan and core
    core = cores.length === 0 ? set : intersection(cores[cores.length - 1], set);
    pan = pans.length === 0 ? set : union(pans[pans.length - 1], set);
    pans.push(pan);
    cores.push(core);
    if (unicorePresent) {
        unicore = intersection(unicores[unicores.length - 1], set);
        unicores.push(unicore);
    }

    matrix.addGenome(bioproject_id);

    // Return the results to the host
    temp = {};
    temp.bioproject_id = bioproject_id;
    temp.pan = pan.length;
    temp.peptide_list = set;
    temp.name = name;
    temp.core = core.length;
    temp.name = name;
    temp.peptides = set.length;
    if (unicorePresent) {
        temp.unicore = unicore.length;
    }
    sendToHost("processLoadedGenome", {data: temp, rank: request_rank});
}

/**
 * Removes a genome from the data
 *
 * @param <Number> bioproject_id The id of the genome to remove
 * @param <Array> newOrder The new order of the genomes
 * @param <Number start The id where the change of order starts
 */
function removeData(bioproject_id, newOrder, start) {
    // Remove stuff
    var l = pans.length;
    delete data[bioproject_id];
    pans.splice(l - 1, 1);
    cores.splice(l - 1, 1);
    unicores.splice(l - 1, 1);
    unicorePresent = false;
    unicores = [];

    // Recalculate stuff
    recalculatePanCore(newOrder, start, l - 2);
    getUniqueSequences(newOrder, false);
    matrix.removeGenome(bioproject_id);
}

// Recalculates the pan and core data based on a
// given order, from start till stop
function recalculatePanCore(newOrder, start, stop) {
    var i = 0,
        set,
        temp,
        response = [];
    order = newOrder;
    if (start === 0) {
        unicorePresent = false;
        unicores = [];
        getUniqueSequences(order);
    }
    for (i = start; i <= stop; i++) {
        set = data[order[i]].peptide_list;
        if (i === 0) {
            cores[i] = set;
            pans[i] = set;
        } else {
            cores[i] = intersection(cores[i - 1], set);
            pans[i] = union(pans[i - 1], set);
            if (unicorePresent) {
                unicores[i] = intersection(unicores[i - 1], set);
            }
        }
    }
    for (i = 0; i < order.length; i++) {
        temp = {};
        temp.bioproject_id = order[i];
        temp.pan = pans[i].length;
        temp.core = cores[i].length;
        temp.peptides = data[order[i]].peptides;
        if (unicorePresent) {
            temp.unicore = unicores[i].length;
        }
        response.push(temp);
    }

    sendToHost("processPancoreData", {data : response, lca : lca, rank : rank});
}

// Sorts the genomes in a given order
function autoSort(type) {
    if (order.length === 0) {
        return;
    }

    var i,
        sortFunction,
        tempPan,
        tempCore,
        optId,
        optVal,
        temp,
        easySort = true,
        clustered = false,
        sortableArray = [],
        tempOrder = [],
        newOrder = [],
        start;
    // Set up sort function based on type
    switch (type) {
        case 'name':
            sortFunction = function (a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (b.name < a.name) {
                    return 1;
                }
                return 0;
            };
            break;
        case 'size':
            sortFunction = function (a, b) {
                return b.size - a.size;
            };
            break;
        case 'clustered':
            clustered = true;
            break;
        default:
            easySort = false;
    }
    if (clustered) {
        newOrder = matrix.getClusteredOrder();
    } else {
        // Prepare the array to sort
        for (i in data) {
            sortableArray.push({bioproject_id : data[i].bioproject_id, name : data[i].name, size : data[i].peptides});
        }
        // Do the actual sorting
        if (easySort) {
            sortableArray.sort(sortFunction);
        } else {
            tempPan = data[order[0]].peptide_list;
            tempCore = data[order[0]].peptide_list;
            for (i = 0; i < sortableArray.length; i++) {
                if (sortableArray[i].bioproject_id === order[0]) {
                    tempOrder.push(sortableArray[i]);
                    delete sortableArray[i];
                    break;
                }
            }
            while (tempOrder.length < sortableArray.length) {
                optId = -1;
                optVal = 0;
                for (i = 0; i < sortableArray.length; i++) {
                    if (sortableArray[i] !== undefined) {
                        if (type === "minpan") {
                            temp = union(tempPan, data[sortableArray[i].bioproject_id].peptide_list);
                            if (optId === -1 || temp.length < optVal) {
                                optId = i;
                                optVal = temp.length;
                            }
                        } else if (type === "maxcore") {
                            temp = intersection(tempCore, data[sortableArray[i].bioproject_id].peptide_list);
                            if (optId === -1 || temp.length > optVal) {
                                optId = i;
                                optVal = temp.length;
                            }
                        } else if (type === "optimal") {
                            temp = union(tempPan, data[sortableArray[i].bioproject_id].peptide_list).length - intersection(tempCore, data[sortableArray[i].bioproject_id].peptide_list).length;
                            if (optId === -1 || temp < optVal) {
                                optId = i;
                                optVal = temp;
                            }
                        }
                    }
                }
                if (type === "minpan") {
                    tempPan = union(tempPan, data[sortableArray[optId].bioproject_id].peptide_list);
                } else if (type === "maxcore") {
                    tempCore = intersection(tempCore, data[sortableArray[optId].bioproject_id].peptide_list);
                } else if (type === "optimal") {
                    tempPan = union(tempPan, data[sortableArray[optId].bioproject_id].peptide_list);
                    tempCore = intersection(tempCore, data[sortableArray[optId].bioproject_id].peptide_list);
                }
                tempOrder.push(sortableArray[optId]);
                delete sortableArray[optId];
            }
            sortableArray = tempOrder;
        }
        // Prepare to return the result
        for (i = 0; i < sortableArray.length; i++) {
            newOrder.push(sortableArray[i].bioproject_id);
        }
    }
    start = newOrder[0] === order[0] ? 1 : 0;
    sendToHost('autoSorted', {order: newOrder, start: start, stop: newOrder.length -1 });
}

// Retrieves the unique sequences
function getUniqueSequences(newOrder, force) {
    force = typeof force !== 'undefined' ? force : true;
    order = newOrder;
    if (order.length > 0) {
        if (force) {
            reallyGetUniqueSequences(data[order[0]].peptide_list);
        } else {
            getJSONByPost("/peptidome/get_lca/", "bioprojects=" + filterIds(order), function (d) {
                // only fetch sequences when there's a new lca
                if (lca !== d.name) {
                    reallyGetUniqueSequences(data[order[0]].peptide_list);
                } else {
                    calculateUnicore(unicoreData);
                }
            });
        }
    }
}

// fetch the sequences
function reallyGetUniqueSequences(s) {
    getJSONByPost("/peptidome/unique_sequences/", "type=uniprot&bioprojects=" + filterIds(order) + "&sequences=[" + s + "]", function (d) {
        lca = d[0];
        calculateUnicore(d[1]);
    });
}

// Calculates the unique peptides data
function calculateUnicore(ud) {
    var i;
    unicorePresent = true;
    unicoreData = ud;
    unicores[0] = unicoreData;
    for (i = 1; i < order.length; i++) {
        unicores[i] = intersection(unicores[i - 1], data[order[i]].peptide_list);
    }
    recalculatePanCore(order, 1, -1);
}

// Resets the data vars
function clearAllData() {
    unicorePresent = false;
    data = {};
    unicoreData = [];
    order = [];
    lca = "";
    pans = [];
    cores = [];
    unicores = [];
    rank++;
    matrix = matrixBackend(data);
}

// Sends a list sequences to the client
function getSequences(type, bioproject_id) {
    var ids,
        ord = getOrderByBioprojectId(bioproject_id);
    switch (type) {
    case 'all':
        ids = data[bioproject_id].peptide_list;
        break;
    case 'pan':
        ids = pans[ord];
        break;
    case 'core':
        ids = cores[ord];
        break;
    case 'unique':
        ids = unicores[ord];
        break;
    default:
        error("Unknown type: " + type);
    }
    getJSONByPost("/peptidome/full_sequences/", "sequence_ids=[" + ids + "]", function (d) {
        sendToHost("processDownloadedSequences", {sequences : d, type : type});
    });
}

/************ These functions are not accessible from the host ****************/

// Returns the rank of a give bioproject_id for the current order
function getOrderByBioprojectId(bioproject_id) {
    var i;
    for (i = 0; i < order.length; i++) {
        if (order[i] == bioproject_id) {
            return i;
        }
    }
    error("unknown bioprojectId: " + bioproject_id);
    return 0;
}

// Provide an error function with the same signature as in the host
function error(error, message) {
    sendToHost("error", {"error" : error, "msg" : message});
}

// Wrapper around xhr json request
function getJSON(url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                var data = JSON.parse(req.responseText);
                callback(data);
            } else {
                error("request error for " + url, "It seems like something went wrong while we loaded the data. Are you still conected to the internet? You might want to reload this page.");
            }
        }
    };
    req.send(null);
}

// Wrapper around xhr json request
function getJSONByPost(url, data, callback) {
    var req = new XMLHttpRequest();
    req.open('POST', url, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                var data = JSON.parse(req.responseText);
                callback(data);
            } else {
                error("request error for " + url, "It seems like something went wrong while we loaded the data. Are you still conected to the internet? You might want to reload this page.");
            }
        }
    };
    req.send(data);
}

function genomeSimilarity(peptide_list1, peptide_list2) {
    return intersection(peptide_list1, peptide_list2).length / union(peptide_list1, peptide_list2).length;
}

/**
 * Removes [,;:] from a string and replaces spaces by underscores. Also adds
 * the bioprojectid.
 *
 * @param <Genome> genome The genome we want to convert
 */
function generateNewickName(genome) {
    return genome.name.replace(/ /g, "_").replace(/[,;:-]/g, "_") + "-" + genome.bioproject_id;
}

/**
 * Returns a new array containing only real bioproject ids
 *
 * @param <Array> a A list of ids.
 */
function filterIds(a) {
    var r = [],
        i;
    for (i = 0; i < a.length; i++) {
        if (!isNaN(+a[i])) {
            r.push(a[i]);
        }
    }
    return r;
}

// union and intersection for sorted arrays
function union(a, b) {
    var r = [],
        i = 0,
        j = 0;
    while (i < a.length && j < b.length) {
        if (a[i] < b[j]) {
            r.push(a[i]);
            i++;
        } else if (a[i] > b[j]) {
            r.push(b[j]);
            j++;
        } else {
            r.push(a[i]);
            i++;
            j++;
        }
    }
    while (i < a.length) {
        r.push(a[i]);
        i++;
    }
    while (j < b.length) {
        r.push(b[j]);
        j++;
    }
    return r;
}
function intersection(a, b) {
    var r = [],
        i = 0,
        j = 0;
    while (i < a.length && j < b.length) {
        if (a[i] < b[j]) {
            i++;
        } else if (a[i] > b[j]) {
            j++;
        } else {
            r.push(a[i]);
            i++;
            j++;
        }
    }
    return r;
}
