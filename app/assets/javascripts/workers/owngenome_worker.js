// Add an event handler to the worker
self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
    case 'log':
        sendToHost("log", data.msg);
        break;
    case 'processFile':
        processFile(data.msg.file);
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
 */
function processFile(file) {
    var peptides = digest(parseFasta(file));
    sendToHost("log", peptides);
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
        digest,
        i,
        j;
    for (i = 0; i < proteins.length; i++) {
        digest = proteins[i].replace(/([KR])([^P])/g,"$1+$2")
            .replace(/([KR])([^P+])/g,"$1+$2")
            .split("+");
        for (j = 0; j < digest.length; j++) {
            if (digest[j].length >=5) {
                peptides.push(digest[j]);
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
    // TODO add slice
    /*$.post( "/pancore/convert_peptides", { 'peptides': peptides }, function (data) {
        data.sort(function(a,b){return a-b});
        // Store
        var genomes,
            name,
            id;
        if(!localStorage.genomeList) {
            genomes = [];
        } else {
            genomes = JSON.parse(localStorage.genomeList);
        }
        name = "user " + genomes.length;
        id = "user_" + genomes.length;
        genomes.push(name);
        localStorage[name] = JSON.stringify(data);
        localStorage.genomeList = JSON.stringify(genomes);
        table.addGenome({
            "bioproject_id" : id,
            "name" : name,
            "status" : "Loading",
            "position" : 100,
            "abbreviation" : name
        });
        //sendToWorker("loadUserData", {"ids": data, "name": name, "id": id});
    }, "json");*/
}
