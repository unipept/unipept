/* This is the heavy lifting function of our sim_matrix implementation
 * We get a list of peptide_list's and we update the matrix row by row
 */
function calculateSimilarity (list_of_peptide_info) {
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

function genomeSimilarity (peptide_list1, peptide_list2) {
    return intersection(peptide_list1, peptide_list2).length / union(peptide_list1, peptide_list2).length;
}

function clusterMatrix (matrix) {
    // call our recursive cluster function
    var result = clusterMatrixRec(matrix, {}, []);

    var result_order = result['order'];
    var first = result_order.splice(-1,1)[0];
    var new_order = [first.x,first.y];

    for (i = result_order.length - 1; i >= 0; i--) {
        var index = new_order.indexOf(result_order[i]['x']);
        new_order.splice(index, 0, result_order[i]['y']);
    }
    sendToHost('NewOrder', new_order);

    /* TODO: we need this again
    // constuct newick format of tree
    var tree = [first.x, first.y, first.value];
    var treeOrder = [];

    for (i = result_order.length - 1; i >= 0; i--) {
        var next = result_order[i];
        // find next.x recursively
        findAndReplace(tree, next.x, next.y, next.value);
    }
    for (i = 0; i < new_order.length; i++) {
        treeOrder[new_order[i]] = i;
    }
    sendToHost('sim_graph', {'data': arrayToNewick(tree), 'order': treeOrder});
    */
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

/* Setup event listening */
self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
    case 'CalculateSimilarity':
        calculateSimilarity(data.msg);
        break;
    case 'ClusterMatrix':
        clusterMatrix(data.msg);
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
