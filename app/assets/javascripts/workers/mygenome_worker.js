// Add an event handler to the worker
self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
    case 'log':
        sendToHost("log", data.msg);
        break;
    case 'processFile':
        processFile(data.msg.file, data.msg.name, data.msg.id);
        break;
    default:
        error(data.msg);
    }
}, false);

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
 * Processes the content of a fasta file
 *
 * @param <String> file The content of a fasta file
 * @param <String> name The name of the genome
 * @param <String> id The generated id of the genome
 */
function processFile(file, name, id) {
    var peptides,
        ids,
        status;
    try {
        peptides = digest(parseFasta(file));
        ids = convertPeptidesToInts(peptides);
        status = "ok";
    } catch (e) {
        status = "failed";
    } finally {
        sendToHost("processConvertedGenome", {
            ids: ids,
            name: name,
            id: id,
            status: status
        });
    }
}

/**
 * Parses a fasta-string into an array of sequences
 *
 * @param <String> fasta A multiline string containing one or more fasta
 *      entries
 */
function parseFasta(fasta) {
    var lines = fasta.match(/[^\r\n]+/g),
        entries = [],
        line = "",
        entry = "",
        i;
    if (lines[0].charAt(0) !== ">") {
        throw "No FASTA file";
    }
    for (i = 0; i < lines.length; i++) {
        line = lines[i];
        if (line.charAt(0) === ">" || i === lines.length - 1) {
            entries.push(entry);
            entry = "";
        } else {
            entry = entry + lines[i];
        }
    }
    return entries;
}

/**
 * Performs an in silico trypsin digest on a list of proteins
 *
 * @param <Array> proteins A list with proteins
 */
function digest(proteins) {
    var peptides = [],
        digestList,
        i,
        j;
    for (i = 0; i < proteins.length; i++) {
        digestList = proteins[i].replace(/([KR])([^P])/g, "$1+$2")
            .replace(/([KR])([^P+])/g, "$1+$2")
            .split("+");
        for (j = 0; j < digestList.length; j++) {
            if (digestList[j].length >= 5) {
                peptides.push(digestList[j]);
            }
        }
    }
    return peptides;
}

/**
 * Queries the database to convert the peptides to integers
 *
 * @param <Array> peptides A list with peptides
 */
function convertPeptidesToInts(peptides) {
    var sliceSize = 1000,
        ids = [],
        req = new XMLHttpRequest(),
        i,
        slice;

    for (i = 0; i < peptides.length; i += sliceSize) {
        slice = peptides.slice(i, i + sliceSize);
        req.open('POST', "/peptidome/convert_peptides", false);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send("peptides=" + JSON.stringify(slice));
        if (req.status === 200) {
            slice = JSON.parse(req.responseText);
            ids = ids.concat(slice);
        } else {
            error("request error for /peptidome/convert_peptides", "It seems like something went wrong while we loaded the data");
        }
        if (i % 10000 === 0) {
            sendToHost("processProgress", {progress : ((i +  sliceSize) / peptides.length)});
        }
    }
    return ids.sort(function (a, b) { return a - b; });
}

// Provide an error function with the same signature as in the host
function error(err, message) {
    sendToHost("error", {"error" : err, "msg" : message});
}
