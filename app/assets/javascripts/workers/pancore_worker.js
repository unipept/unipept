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
        loadData(data.msg.id, data.msg.name);
        break;
    case 'loadUserData':
        loadUserData(data.msg.id, data.msg.name, data.msg.ids);
        break;
    case 'removeData':
        removeData(data.msg.id, data.msg.order, data.msg.start);
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
        getSequences(data.msg.type, data.msg.id);
        break;
    case "calculateSimilarity":
        matrix.calculateSimilarity();
        break;
    case "clusterMatrix":
        matrix.clusterMatrix(data.msg.similarity);
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
    function matrixObjectToArray(similarity) {
        var returnMatrix = [],
            i,
            j;
        for (i = 0; i < matrixOrder.length; i++) {
            returnMatrix[i] = [];
            for (j = 0; j < matrixOrder.length; j++) {
                returnMatrix[i][j] = matrixObject[matrixOrder[i]][matrixOrder[j]][similarity];
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
     * removes the last element. Converts the id's to assembly id's.
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
            similarity,
            finalBatch;

        // Be a bit clever with sending data
        if (idsToCalculate.length > 3) {
            sendFullMatrix = false;
        }

        for (x = 0; x < idsToCalculate.length; x++) {
            id = idsToCalculate[x];
            peptides = data[id].peptide_list;

            for (id2 in matrixObject) {
                if (matrixObject[id][id2] === undefined) {
                    if ("" + id === "" + id2) {
                        similarity = {
                            intersection : peptides.length,
                            union        : peptides.length,
                            min          : peptides.length,
                            max          : peptides.length,
                            avg          : peptides.length,
                            simUnion     : 1,
                            simMin       : 1,
                            simMax       : 1,
                            simAvg       : 1,
                            simOchiai    : 1
                        };
                    } else {
                        similarity = genomeSimilarity(peptides, data[id2].peptide_list);
                    }

                    matrixObject[id][id2] = similarity;
                    matrixObject[id2][id] = similarity;
                }
            }

            if (!sendFullMatrix) {
                dataQueue[id] = matrixObject[id];
                finalBatch = (x === idsToCalculate.length - 1);
                if (x % 3 === 2 || finalBatch) {
                    that.sendRows(dataQueue, finalBatch);
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
        sendToHost('processSimilarityData', {
            'fullMatrix' : true,
            'data': m,
            'final' : true
        });
    };

    /**
     * Sends a single row of similarities to the client
     *
     * @param <Map> dataQueue The list of id to data mappings
     * @param <Boolean> final The final batch?
     */
    that.sendRows = function sendRows(dataQueue, final) {
        sendToHost('processSimilarityData', {
            'fullMatrix' : false,
            'data' : dataQueue,
            'final' : final
        });
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
    that.clusterMatrix = function clusterMatrix(similarity) {
        if (matrixOrder.length === 0) {
            return;
        }
        matrixOrder.sort();
        var tree = that.calculateTree(similarity);
        sendToHost('processClusteredMatrix', {
            order : treeToOrder(tree),
            newick : arrayToNewick(tree) + ";"
        });
    };

    /**
     * Clusters the matrix and returns a tree of the clustering
     */
    that.calculateTree = function calculateTree(similarity) {
        var sizes,
            i,
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
        matrixArray = matrixObjectToArray(similarity);

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
 * Requests the sequence id's for a given assembly id. Calls the addData
 * function when done.
 *
 * @param <Number> id The id of the assembly of sequences we want
 * @param <String> name The name of the organism
 */
function loadData(id, name) {
    var requestRank = rank;
    getJSON("/peptidome/sequences/" + id + ".json", function (json_data) {
        addData(id, name, json_data, requestRank);
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
    addData(id, name, ids, rank);
}

/**
 * Processes a list of sequence_id's, received from the webserver and adds it
 * to the data array.
 *
 * @param <Number> id The assembly id of the organism
 * @param <String> name The name of the organism
 * @param <Array> set The ordered array of sequence_id, contains no duplicates
 * @param <Number> request_rank The rank of the request. Used to discard old
 *      requests
 */
function addData(id, name, set, request_rank) {
    var core,
        pan,
        unicore,
        temp;

    // Discard old data
    if (request_rank !== rank) return;

    // Store data for later use
    data[id] = {};
    data[id].id = id;
    data[id].name = name;
    data[id].peptide_list = set;
    data[id].peptides = set.length;

    // Calculate pan and core
    core = cores.length === 0 ? set : intersection(cores[cores.length - 1], set);
    pan = pans.length === 0 ? set : union(pans[pans.length - 1], set);
    pans.push(pan);
    cores.push(core);
    if (unicorePresent) {
        unicore = intersection(unicores[unicores.length - 1], set);
        unicores.push(unicore);
    }

    matrix.addGenome(id);

    // Return the results to the host
    temp = {};
    temp.id = id;
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
 * @param <Number> id The id of the genome to remove
 * @param <Array> newOrder The new order of the genomes
 * @param <Number start The id where the change of order starts
 */
function removeData(id, newOrder, start) {
    // Remove stuff
    var l = pans.length;
    delete data[id];
    pans.splice(l - 1, 1);
    cores.splice(l - 1, 1);
    unicores.splice(l - 1, 1);
    unicorePresent = false;
    unicores = [];

    // Recalculate stuff
    recalculatePanCore(newOrder, start, l - 2);
    getUniqueSequences(newOrder, false);
    matrix.removeGenome(id);
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
        temp.id = order[i];
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
            sortableArray.push({id : data[i].id, name : data[i].name, size : data[i].peptides});
        }
        // Do the actual sorting
        if (easySort) {
            sortableArray.sort(sortFunction);
        } else {
            tempPan = data[order[0]].peptide_list;
            tempCore = data[order[0]].peptide_list;
            for (i = 0; i < sortableArray.length; i++) {
                if (sortableArray[i].id === order[0]) {
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
                            temp = union(tempPan, data[sortableArray[i].id].peptide_list);
                            if (optId === -1 || temp.length < optVal) {
                                optId = i;
                                optVal = temp.length;
                            }
                        } else if (type === "maxcore") {
                            temp = intersection(tempCore, data[sortableArray[i].id].peptide_list);
                            if (optId === -1 || temp.length > optVal) {
                                optId = i;
                                optVal = temp.length;
                            }
                        } else if (type === "optimal") {
                            temp = union(tempPan, data[sortableArray[i].id].peptide_list).length - intersection(tempCore, data[sortableArray[i].id].peptide_list).length;
                            if (optId === -1 || temp < optVal) {
                                optId = i;
                                optVal = temp;
                            }
                        }
                    }
                }
                if (type === "minpan") {
                    tempPan = union(tempPan, data[sortableArray[optId].id].peptide_list);
                } else if (type === "maxcore") {
                    tempCore = intersection(tempCore, data[sortableArray[optId].id].peptide_list);
                } else if (type === "optimal") {
                    tempPan = union(tempPan, data[sortableArray[optId].id].peptide_list);
                    tempCore = intersection(tempCore, data[sortableArray[optId].id].peptide_list);
                }
                tempOrder.push(sortableArray[optId]);
                delete sortableArray[optId];
            }
            sortableArray = tempOrder;
        }
        // Prepare to return the result
        for (i = 0; i < sortableArray.length; i++) {
            newOrder.push(sortableArray[i].id);
        }
    }
    start = newOrder[0] === order[0] ? 1 : 0;
    sendToHost('autoSorted', {order: newOrder, start: start, stop: newOrder.length - 1 });
}

// Retrieves the unique sequences
function getUniqueSequences(newOrder, force) {
    force = typeof force !== 'undefined' ? force : true;
    order = newOrder;
    if (order.length > 0) {
        if (force) {
            reallyGetUniqueSequences(data[order[0]].peptide_list);
        } else {
            getJSONByPost("/peptidome/get_lca/", "ids=" + filterIds(order), function (d) {
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
    getJSONByPost("/peptidome/unique_sequences/", "ids=" + filterIds(order) + "&sequences=[" + s + "]", function (d) {
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
function getSequences(type, id) {
    var ids,
        ord = getOrderById(id);
    switch (type) {
    case 'all':
        ids = data[id].peptide_list;
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
        sendToHost("processDownloadedSequences", {sequences : d, type : type, id : id});
    });
}

/************ These functions are not accessible from the host ****************/

// Returns the rank of a given assembly id for the current order
function getOrderById(id) {
    var i;
    for (i = 0; i < order.length; i++) {
        if (order[i] == id) {
            return i;
        }
    }
    error("unknown id: " + id);
    return 0;
}

// Provide an error function with the same signature as in the host
function error(err, message) {
    sendToHost("error", {"error" : err, "msg" : message});
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

function genomeSimilarity(peptideList1, peptideList2) {
    var intersect = intersection(peptideList1, peptideList2).length,
        union = peptideList1.length + peptideList2.length - intersect,
        min = Math.min(peptideList1.length, peptideList2.length),
        max = Math.max(peptideList1.length, peptideList2.length),
        avg = (peptideList1.length + peptideList2.length) / 2,
        ochiai = Math.sqrt(peptideList1.length * peptideList2.length);
    return {
        intersection : intersect,
        union        : union,
        min          : min,
        max          : max,
        avg          : avg,
        simUnion     : intersect / union,
        simMin       : intersect / min,
        simMax       : intersect / max,
        simAvg       : intersect / avg,
        simOchiai    : intersect / ochiai
    };
}

/**
 * Removes [,;:] from a string and replaces spaces by underscores. Also adds
 * the assembly id.
 *
 * @param <Genome> genome The genome we want to convert
 */
function generateNewickName(genome) {
    return genome.name.replace(/ /g, "_").replace(/[,;:-]/g, "_") + "-" + genome.id;
}

/**
 * Returns a new array containing only real assembly ids
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
function unionIntersection(a, b) {
    var intersection = [],
        union = [],
        i = 0,
        j = 0;
        while (i < a.length && j < b.length) {
            if (a[i] < b[j]) {
                union.push(a[i]);
                i++;
            } else if (a[i] > b[j]) {
                union.push(b[j]);
                j++;
            } else {
                union.push(a[i]);
                intersection.push(a[i]);
                i++;
                j++;
            }
        }
        while (i < a.length) {
            union.push(a[i]);
            i++;
        }
        while (j < b.length) {
            union.push(b[j]);
            j++;
        }
        return {
            union : union,
            intersection : intersection
        };
}
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
