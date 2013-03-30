#! /bin/bash
rails runner "Sequence.batch_process('$1', '$2')"
rm public/progress
echo "all done!"