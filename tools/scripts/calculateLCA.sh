#!/bin/bash

# Script invoked with no command-line args?
if [ $# -eq "0" ]    
then
  echo "Usage: `basename $0` [-r] stopId equateIL"
  echo "-r resets all counters in the database"
  exit
fi

# Option handling
while getopts ":e" opt; do
  case $opt in
    e)
      echo "Reset counters"
      mysql -uunipept -punipept unipept -e "UPDATE counters SET value = 0 WHERE value > 0;"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
	    exit
      ;;
  esac
done

# let $1 be the first non-option argument
shift $(($OPTIND - 1))

echo "Start counting"
rails runner "Counter.count($1, $2)"
rm -f public/progress
echo "All done!"