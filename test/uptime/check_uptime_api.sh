# This script checks if the API-server returns results as expected, and can thus be used by GitHub actions to
# periodically verify that our server is still up and running

set -e
set -o pipefail

# How long should a call to the CLI take before we mark it as slow? (in seconds)
RUNTIME_TRESHOLD="10"

RESULTS=$(curl -s --request GET "api.unipept.ugent.be/api/v1/taxa2tree.json?input[]=87&input[]=45&input[]=65&link=true&delete=true")

# Check that the command returns a valid URL
if ! [[ $RESULTS =~ gist\.github\.com ]]
then
  exit 1
fi

# Check timing of specific results
START=$(date +%s)
curl -s --request GET "http://api.unipept.ugent.be/api/v1/taxa2tree.json?input[]=AAAALTER" &> /dev/null
END=$(date +%s)

RUNTIME=$((END-START))

if [[ $(echo "$RUNTIME > $RUNTIME_TRESHOLD" | bc -l) ]]
then
  exit 1
fi

# All is well!
exit 0
