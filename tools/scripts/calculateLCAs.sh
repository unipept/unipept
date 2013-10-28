#!/bin/bash

# Script invoked with no command-line args?
if [ $# -eq "0" ]    
then
  echo "Usage: `basename $0` equate_il"
  exit
fi

echo "Start calculating"
rails runner "Sequence.calculate_lcas($1)"
rm -f public/progress
echo "All done!"