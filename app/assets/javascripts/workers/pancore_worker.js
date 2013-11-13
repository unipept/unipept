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
    sim_matrix = [];

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
        getUniqueSequences();
        break;
    case 'autoSort':
        autoSort(data.msg.type);
        break;
    case "getSequences":
        getSequences(data.msg.type, data.msg.bioproject_id);
        break;
    case "calculateSimilarity":
        calculateSimilarity();
        break;
    case "clusterMatrix":
        clusterMatrix();
        break;
    case "newDataAdded":
        addNewMatrixdata();
        break;
    default:
        error(data.msg);
    }
}, false);

// Sends a response type and message to the host
function sendToHost(type, message) {
    self.postMessage({'type': type, 'msg': message});
}

// Loads peptides, based on bioproject_id
function loadData(bioproject_id, name) {
    request_rank = rank;
    getJSON("/pancore/sequences/" + bioproject_id + ".json", function (json_data) {
        addData(bioproject_id, name, json_data, request_rank);
    });
}

// Adds new dataset to the data array
function addData(bioproject_id, name, set, request_rank) {
    var core,
        pan,
        unicore,
        temp;
    if (request_rank !== rank) return;
    // Store data for later use
    data[bioproject_id] = {};
    data[bioproject_id].bioproject_id = bioproject_id;
    data[bioproject_id].name = name;
    data[bioproject_id].peptide_list = set;
    data[bioproject_id].peptides = set.length;
    order.push(bioproject_id);

    // Calculate pan and core
    core = cores.length === 0 ? set : intersection(cores[cores.length - 1], set);
    pan = pans.length === 0 ? set : union(pans[pans.length - 1], set);
    pans.push(pan);
    cores.push(core);
    if (unicorePresent) {
        unicore = intersection(unicores[unicores.length - 1], set);
        unicores.push(unicore);
    }

    // Return the results to the host
    temp = {};
    temp.bioproject_id = bioproject_id;
    temp.pan = pan.length;
    temp.core = core.length;
    temp.peptides = set.length;
    if (unicorePresent) {
        temp.unicore = unicore.length;
    }
    sendToHost("addData", {data: temp, rank: request_rank});
}

// Removes a genomes from the data
function removeData(bioproject_id, newOrder, start) {
    var l = pans.length;
    var i = order.indexOf(bioproject_id);
    delete data[bioproject_id];
    pans.splice(l - 1, 1);
    cores.splice(l - 1, 1);
    unicores.splice(l - 1, 1);
    unicorePresent = false;
    unicores = [];
    recalculatePanCore(newOrder, start, l - 2);
    getUniqueSequences();


    // Update the matrix without calculating everything again
    // TODO: move this into a generic method
    var names = [];

    for (x = 0; x < newOrder.length; x++) {
        var bioproject_id = newOrder[x];
        names.push(data[bioproject_id].name);
    }

    var length = sim_matrix.length;
    for(var x = 0; x < length; x++) {
        sim_matrix[x].splice(i, 1);
    }
    sim_matrix.splice(i, 1);
    sendToHost('sim_matrix', {'genomes': names, 'sim_matrix': sim_matrix, 'order': newOrder});
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
        getUniqueSequences();
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
    sendToHost("setPancoreData", {data : response, lca : lca, rank : rank});
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
    recalculatePanCore(newOrder, start, newOrder.length - 1);
}

// Retrieves the unique sequences
function getUniqueSequences() {
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
        sendToHost("sequencesDownloaded", {sequences : d, type : type});
    });
}

// These functions are not accessible from the host

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

function calculateSimilarity() {
    // 0,0 is the topleft coordinate
    var x = 0;
    var y = 0;
    var names = [];
    sim_matrix = [];
    for (x = 0; x < order.length; x++) {
        sim_matrix[x] = [];
    }

    for (x = 0; x < order.length; x++) {
        var bioproject_id = order[x];
        names.push(data[bioproject_id].name);
        var compare_list = data[bioproject_id].peptide_list;

        // only need to calculate upper part of matrix
        for (y = 0 ; y < order.length; y ++) {
            var peptide_list = data[order[y]].peptide_list;
            sim_matrix[x][y] = genomeSimilarity(compare_list, peptide_list);
        }
    }
    sendToHost('sim_matrix', {'genomes': names, 'sim_matrix': sim_matrix, 'order': order});
    return sim_matrix;
}

function addNewMatrixdata() {
    var initial_length = sim_matrix.length;
    var x = 0;
    var names = [];
    for (x = initial_length; x < order.length; x++) {
        sim_matrix[x] = [];
    }

    for (x = 0; x < order.length; x++) {
        var bioproject_id = order[x];
        names.push(data[bioproject_id].name);
    }

    for (x = initial_length; x < order.length; x++) {
        for (y = 0 ; y < order.length; y ++) {
            sim_matrix[x][y] = 0;
        }
    }
    sendToHost('sim_matrix', {'genomes': names, 'sim_matrix': sim_matrix, 'order': order});
    return sim_matrix;
}

function clusterMatrix() {
    // Check if we already calculated the similarity
    if (! (sim_matrix[0][0] > 0)) {
        calculateSimilarity();
    }

    // Create a deep copy and call our recursive cluster function
    var matrix_deep_copy = [];
    var i = 0, j = 0;
    for (i = 0; i < sim_matrix.length; i++) {
        matrix_deep_copy[i] = [];
        for (j = 0; j < sim_matrix[i].length; j++) {
            matrix_deep_copy[i][j] = sim_matrix[i][j];
        }
    }
    var result = clusterMatrixRec(matrix_deep_copy, {}, []);

    var result_order = result['order'];
    sendToHost('log', result_order);
    var first = result_order.splice(-1,1)[0];
    var new_order = [first.x,first.y];

    for (i = result_order.length - 1; i >= 0; i--) {
        var index = new_order.indexOf(result_order[i]['x']);
        new_order.splice(index, 0, result_order[i]['y']);
    }
    sendToHost('newOrder', new_order);

    // constuct newick format of tree
    var tree = [first.x, first.y, first.value];

    for (i = result_order.length - 1; i >= 0; i--) {
        var next = result_order[i];
        // find next.x recursively
        findAndReplace(tree, next.x, next.y, next.value);
    }
    sendToHost('log', JSON.stringify(tree));
    sendToHost('log', arrayToNewick(tree));
    sendToHost('sim_graph', arrayToNewick(tree));
}


function addDistance(array) {
    var distance = array.splice(-1,1);
    for(var i = 0; i < array.length ; i ++) {
        var val = array[i];
        if (val instanceof Array) {
            addDistance(val);
        } else {
            array[i] = "" + array[i] + ":" + distance;
        }
    }
    array.push(distance[0]);
}
function arrayToNewick(array) {
    /* TODO: someday i will write this in a good way */
    addDistance(array);
    var string = JSON.stringify(array).replace(/\[/g, '(').replace(/\]/g, ')').replace(/\"/g, '');
    string = string.replace(/,([.0-9]*)\)/g, '):$1');
    return string + ';';
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

function clusterMatrixRec(matrix, cluster, order) {
    // Lame recursion check
    if(order.length == matrix.length - 1) {
        return {'order': order, 'cluster': cluster};
    }

    // find highest similarity
    var x = 0, y = 0, largest = -1;
    var i = 0, j = 0;
    for (i = 0 ; i < matrix.length; i++) {
        for (j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] > largest && i != j) {
                x = i;
                y = j;
                largest = matrix[i][j];
            }
        }
    }

    if(cluster[x]) {
        cluster[x].push(y);
    } else {
        cluster[x] = [y];
    }

    order.push({'x': x, 'y': y, 'value': largest});

    // update sim matrix with average values
    for (j = 0 ; j < matrix[x].length; j++) {
        if ( j != y && j != x ) {
            matrix[x][j] = (matrix[x][j] + matrix[y][j]) / 2;
            matrix[j][x] = (matrix[x][j] + matrix[y][j]) / 2;
        }
    }

    // set the value of comparison with y to zero
    for (j = 0 ; j < matrix.length; j++) {
        matrix[j][y] = -1;
        matrix[y][j] = -1;
    }

    return clusterMatrixRec(matrix, cluster, order);

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
