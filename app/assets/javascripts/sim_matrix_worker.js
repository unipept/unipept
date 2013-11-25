/* This is the heavy lifting function of our sim_matrix implementation
 * We get a list of peptide_list's and we update the matrix row by row
 */
function calculateSimilarity(list_of_peptide_info) {
    for (var x = 0; x < list_of_peptide_info.length; x++) {
        var new_row = [],
            compare_list = list_of_peptide_info[x];
        
        for (y = 0 ; y < list_of_peptide_info.length; y ++) {
            var peptide_list = list_of_peptide_info[y];
            new_row[y] = genomeSimilarity(compare_list, peptide_list);
        }
        sendToHost("RowCalculated", {row: x, data: new_row});
    }
}

function genomeSimilarity(peptide_list1, peptide_list2) {
    return intersection(peptide_list1, peptide_list2).length / union(peptide_list1, peptide_list2).length;
}

/* Setup event listening */
self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
    case 'CalculateSimilarity':
        calculateSimilarity(data.msg);
        break;
    }
});


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

function sendToHost(type, message) {
    self.postMessage({'type': type, 'msg': message});
}
