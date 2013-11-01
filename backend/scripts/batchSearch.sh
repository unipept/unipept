#!/bin/bash
# settings:
# $1: input file
# $2: output file
# $3: equate_il
# $4: filter_duplicates
# $5: handle_missed
rails runner "Sequence.batch_process('$1', '$2', $3, $4, $5)"
rm public/progress
echo "all done!"