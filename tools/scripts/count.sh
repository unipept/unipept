#! /bin/bash
rails runner "Counter.count('$1', '$2')"
rm public/progress
echo "all done!"