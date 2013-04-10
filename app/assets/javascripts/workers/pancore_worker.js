// vars
var data = {},
    pan = [],
    core = [],
    pans = [],
    cores = [];

// Add an event handler to the worker
self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
    case 'log':
        sendToHost("print", data.msg);
        break;
    case 'loadData':
        loadData(data.msg.name, data.msg.refseq_id);
        break;
    case 'clearAllData':
        clearAllData();
        break;
    case 'recalculatePanCore':
        recalculatePanCore(data.msg.order, data.msg.start, data.msg.stop);
        break;
    default:
        sendToHost("error", data.msg);
    }
}, false);

// Sends a response type and message to the host
function sendToHost(type, message) {
    self.postMessage({'type': type, 'msg': message});
}

// Loads peptides, based on refseq_id
function loadData(name, refseq_id) {
    getJSON("/pancore/sequences/" + refseq_id + ".json", function (json_data) {
        addData(name, json_data);
    });
}

// Adds new dataset to the data array
function addData(name, set) {
    // Store data for later use
    data[name] = set;

    // Calculate pan and core
    core = pan.length === 0 ? set : intersection(core, set);
    pan = union(pan, set);
    pans.push(pan);
    cores.push(core);

    // Return the results to the host
    var temp = {};
    temp.name = name;
    temp.pan = pan.length;
    temp.core = core.length;
    sendToHost("addData", temp);
}

// Recalculates the pan and core data based on a
// given order, from start till stop
function recalculatePanCore(order, start, stop) {
    for (var i = start; i <= stop; i++) {
        var set = data[order[i]];
        if (i === 0) {
            cores[i] = set;
            pans[i] = set;
        } else {
            cores[i] = intersection(cores[i - 1], set);
            pans[i] = union(pans[i - 1], set);
        }
    }
    var response = [];
    for (var i = 0; i < order.length; i++) {
        var temp = {};
        temp.name = order[i];
        temp.pan = pans[i].length;
        temp.core = cores[i].length;
        response.push(temp);
    }
    sendToHost("setVisData", response);
}

// Resets the data vars
function clearAllData() {
    data = {};
    pan = [];
    core = [];
    pans = [];
    cores = [];
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

// union and intersection for sorted arrays
function union(a, b){
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
function intersection(a, b){
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