# This script checks if the API-server returns results as expected, and can thus be used by GitHub actions to
# periodically verify that our server is still up and running

set -e
set -o pipefail

# How long should a call to the CLI take before we mark it as slow? (in seconds)
RUNTIME_TRESHOLD="30"

# Check timing of specific results
START=$(date +%s)
curl -s --request GET "http://api.unipept.ugent.be/api/v1/taxa2tree.json?input[]=AAAALTER" &> /dev/null
END=$(date +%s)

RUNTIME=$((END-START))

if [[ $(echo "$RUNTIME > $RUNTIME_TRESHOLD" | bc -l) ]]
then
  echo "It took $RUNTIME seconds for the server to produce a valid response." >&2
  exit 1
fi

# All is well!
exit 0
