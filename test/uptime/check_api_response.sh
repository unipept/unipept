# This script checks if the API-server returns results as expected, and can thus be used by GitHub actions to
# periodically verify that our server is still up and running

set -e
set -o pipefail

RESULTS=$(curl -s --request GET "api.unipept.ugent.be/api/v1/taxa2tree.json?input[]=87&input[]=45&input[]=65&link=true&delete=true")

# Check that the command returns a valid URL
if ! [[ $RESULTS =~ gist\.github\.com ]]
then
  echo "Taxa2Tree did not return a valid URL." >&2
  exit 1
fi

# All is well!
exit 0
