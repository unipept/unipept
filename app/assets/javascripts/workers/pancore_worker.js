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
        getUniqueSequences(data.msg.order);
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
    var matrix = [],
        idsToCalculate = [],
        matrixOrder  = [],
        matrixObject = {};

    // variable to keep track of dirty state
    var dirty = false;

    var that = {};

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
     * TODO ?
     */
    function flattenAndRemoveDistance(array) {
        var result = [],
            i,
            j;
        for (i = 0; i < array.length - 1; i++) {
            if (array[i] instanceof Array) {
                var recurse = flattenAndRemoveDistance(array[i]);
                for (j = 0; j < recurse.length; j++) {
                    result.push(recurse[j]);
                }
            } else {
                result.push(array[i]);
            }
        }
        return result;
    }

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
     * TODO
     */
    that.removeGenome = function (genome_id) {
        var index = matrixOrder.indexOf(genome_id),
            x;
        matrixOrder.splice(index, 1);

        matrix.splice(index, 1);
        for (x = 0; x < matrix.length; x++) {
            // add -1 to the end
            matrix[x].splice(index, 1);
        }

        /* shift indices to the left when we remove genomes, and remove index if necessary */
        var toRemove = -1;
        for (x = 0; x < idsToCalculate.length; x++) {
            var val = idsToCalculate[x];
            if (val === index) {
                // we need to remove this
                toRemove = x;
            } else if (val > index) {
                idsToCalculate[x] -= 1;
            }
        }
        if (toRemove !== -1) {
            idsToCalculate.splice(toRemove, 1);
        }
    };

    /**
     * Calculates all uncalculated cells in the similarity matrix
     */
    that.calculateSimilarity = function calculateSimilarity() {
        var sendFullMatrix = false,
            x,
            id,
            peptides,
            id2,
            similarity;

        // Be a bit clever with sending data
        if (idsToCalculate.length > 3) {
            sendFullMatrix = true;
        }

        // TODO for now, always send full matrix
        sendFullMatrix = true;

        for (x = 0; x < idsToCalculate.length; x++) {
            id = idsToCalculate[x];
            peptides = data[id].peptide_list;

            for (id2 in matrixObject) {
                similarity = genomeSimilarity(peptides, data[id2].peptide_list);
                matrixObject[id][id2] = similarity;
                matrixObject[id2][id] = similarity;
            }

            if (!sendFullMatrix) {
                that.sendRow(id, matrixObject[id]);
            }
        }

        if (sendFullMatrix) {
            that.sendMatrix(matrixObject);
        }

        dirty = false;
        idsToCalculate = [];
    };

    that.reOrder = function (new_order) {
        sendToHost('newOrder', new_order);
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
     * @param <Number> row The id of the row
     * @param <SimObject> row A single row of the similarity matrix
     */
    that.sendRow = function sendRow(id, row) {
        sendToHost('processSimilarityData', {'fullMatrix' : false, 'data' : {'id' : id, 'row' : row}});
    };

    that.clusterMatrix = function () {
        var i;

        while (dirty) {
            that.calculateSimilarity();
        }

        // Create a deep copy and call our recursive cluster function
        var matrix_deep_copy = [];
        for (i = 0; i < matrix.length; i++) {
            matrix_deep_copy[i] = matrix[i].slice(0);
        }
        var result = clusterMatrixRec(matrix_deep_copy, {}, []);

        var result_order = result.order;
        var first = result_order.splice(-1, 1)[0];


        var tree = [first.x, first.y, first.value];

        for (i = result_order.length - 1; i >= 0; i--) {
            var next = result_order[i];
            // find next.x recursively
            findAndReplace(tree, next.x, next.y, next.value);
        }
        var clusterOrder = flattenAndRemoveDistance(tree);
        that.reOrder(clusterOrder);

        sendToHost('newick', arrayToNewick(tree));
        return clusterOrder;
    };

    function clusterMatrixRec(matrix, cluster, order) {
        // Lame recursion check
        if (order.length === matrix.length - 1) {
            return {'order': order, 'cluster': cluster};
        }

        // find highest similarity
        var x = 0, y = 0, largest = -1;
        var i = 0, j = 0;
        for (i = 0; i < matrix.length; i++) {
            for (j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] > largest && i !== j) {
                    x = i;
                    y = j;
                    largest = matrix[i][j];
                }
            }
        }

        if (cluster[x]) {
            cluster[x].push(y);
        } else {
            cluster[x] = [y];
        }

        order.push({'x': x, 'y': y, 'value': largest});

        // update sim matrix with average values
        for (j = 0; j < matrix[x].length; j++) {
            if (j !== y && j !== x) {
                matrix[x][j] = (matrix[x][j] + matrix[y][j]) / 2;
                matrix[j][x] = (matrix[x][j] + matrix[y][j]) / 2;
            }
        }

        // set the value of comparison with y to zero
        for (j = 0; j < matrix.length; j++) {
            matrix[j][y] = -1;
            matrix[y][j] = -1;
        }

        return clusterMatrixRec(matrix, cluster, order);

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
    getJSON("/pancore/sequences/" + bioproject_id + ".json", function (json_data) {
        addData(bioproject_id, name, json_data, requestRank);
    });
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

// Removes a genomes from the data
function removeData(bioproject_id, newOrder, start) {
    var l = pans.length;
    delete data[bioproject_id];
    pans.splice(l - 1, 1);
    cores.splice(l - 1, 1);
    unicores.splice(l - 1, 1);
    unicorePresent = false;
    unicores = [];
    recalculatePanCore(newOrder, start, l - 2);
    getUniqueSequences(newOrder);

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
    var i,
        sortFunction,
        tempPan,
        tempCore,
        optId,
        optVal,
        temp,
        easySort = true,
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
            matrix.clusterMatrix();
            sendToHost('reorderTable');
            return;
        default:
            easySort = false;
    }
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
    start = newOrder[0] === order[0] ? 1 : 0;
    sendToHost('autoSorted', {order: newOrder, start: start, end: order.length -1 });
}

// Retrieves the unique sequences
function getUniqueSequences(newOrder) {
    order = newOrder;
    if (order.length > 0) {
        var s = data[order[0]].peptide_list;
        getJSONByPost("/pancore/unique_sequences/", "type=uniprot&bioprojects=" + order + "&sequences=[" + s + "]", function (d) {
            lca = d[0];
            calculateUnicore(d[1]);
        });
    }
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
    getJSONByPost("/pancore/full_sequences/", "sequence_ids=[" + ids + "]", function (d) {
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
                error("request error for " + url, "It seems like something went wrong while we loaded the data");
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
                error("request error for " + url, "It seems like something went wrong while we loaded the data");
            }
        }
    };
    req.send(data);
}

function genomeSimilarity(peptide_list1, peptide_list2) {
    return intersection(peptide_list1, peptide_list2).length / union(peptide_list1, peptide_list2).length;
}

function arrayToNewick(array, prevD) {
    // default to zero
    if(typeof(prevD) === 'undefined') prevD = 0;

    var string = "(";
    var distance = array[array.length - 1];

    for (var i = 0; i < array.length - 1; i++) {
        if(array[i] instanceof Array) {
            string += arrayToNewick(array[i], distance);
        } else {
            string += array[i] + ":" + (1 - distance);
        }
        if (i != array.length - 2) {
            string += ", ";
        }
    }
    string += "):" + (distance - prevD);
    if(typeof(prevD) === 'undefined') string += ';';
    return string;
}

function findAndReplace(tree, x, y, val) {
    var index = -1;
    do {
        index = tree.indexOf(x, index + 1);
    } while (index % 3 === 2)
    if (index == -1) {
        for (var j = 0; j < tree.length - 1; j ++) {
            if( tree[j] instanceof Array) {
                findAndReplace(tree[j], x, y, val);
            }
        }
    } else {
        tree[index] = [x, y, val];
    }
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
