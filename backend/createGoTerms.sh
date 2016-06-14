#!/bin/bash
# Parses the go terms out of an input file

set -e

terms="http://geneontology.org/ontology/go-basic.obo"

wget -q "$terms" -O - | awk '
/^\[Term\]/{
    if (id != 0) {
        printf("%d\t%s\t%s\t%s\n", id, code, namespace, name)
    }
    id++
}
/^id:/{
    sub(/^id: /, "")
    code = $0
}
/^name:/{
    sub(/^name: /, "")
    name = $0
}
/^namespace:/{
    sub(/^namespace: /, "")
    sub("_", " ")
    namespace = $0
}
END {
    printf("%d\t%s\t%s\t%s\n", id, code, namespace, name)
}'
