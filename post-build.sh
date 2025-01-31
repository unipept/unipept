# This script should be executed after the application has been compiled and built. This script is automatically
# executed as part of the "build"-command of npm (as defined in the package.json file).

# Check if running in GitHub Actions
if [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "Skipping script execution in GitHub Actions environment."
    exit 0
fi

# First step, create links to the files that are required by the UMGAP pipeline in the correct location.
UMGAP_VERSION="2024-03-07"
mkdir dist/system
mkdir dist/system/umgap
mkdir dist/system/umgap/${UMGAP_VERSION}

printf "dist/system/umgap/${UMGAP_VERSION}\n" > latest
ln -s "/mnt/datapept/umgap/${UMGAP_VERSION}/taxons.tsv" "dist/system/umgap/${UMGAP_VERSION}/taxons.tsv"
ln -s "/mnt/datapept/umgap/${UMGAP_VERSION}/tryptic.fst" "dist/system/umgap/${UMGAP_VERSION}/tryptic.fst"
ln -s "/mnt/datapept/umgap/${UMGAP_VERSION}/ninemer.fst" "dist/system/umgap/${UMGAP_VERSION}/ninemer.fst"
