# This script checks if the API-server returns results as expected, and can thus be used by GitHub actions to
# periodically verify that our server is still up and running

set -e
set -o pipefail

# How long should a call to the CLI take before we mark it as slow? (in seconds)
RUNTIME_TRESHOLD="1.0"

RESULTS=$(unipept taxa2tree 14 78 56 38 --format url)

# Check that the command returns a valid URL
if ! [[ $RESULTS =~ bl\.ocks\.org ]]
then
  exit 1
fi

# Check timing of specific results
TIMEFORMAT=%R
RUNTIME=$(time unipept pept2taxa AAAAALTER)

bc --version
echo "$RUNTIME > $RUNTIME_TRESHOLD"

if [[ $(echo "$RUNTIME > $RUNTIME_TRESHOLD" | bc -l) ]]
then
  exit 1
fi

# All is well!
exit 0
