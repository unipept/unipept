// This script won't be parsed by JS engines
// because its type is javascript/worker.

// import the set implementation 
importScripts('set.js');

// vars
var data = {},
    pan = new JS.Set(),
    core = new JS.Set();

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
        addData(name, new JS.Set(json_data));
    });
}

// Adds new dataset to the data array
function addData(name, set) {
    // Store data for later use
    data[name] = set;

    // Calculate pan and core
    core = pan.isEmpty() ? set : core.intersection(set);
    pan = pan.union(set);

    // return the results to the host
    var temp = {};
    temp.name = name;
    temp.pan = pan.length;
    temp.core = core.length;
    sendToHost("addData", temp);
}

function getJSON(url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            var data = JSON.parse(req.responseText);
            callback(data);
        }
    };
    req.send(null);
}