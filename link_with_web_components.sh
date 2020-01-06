#! /bin/bash

# ONLY USE DURING DEVELOPMENT
# This is an utility script that can be used to link the unipept-web-components repository with
# this repository so that changes in the web-components are directly reflected in this project.
# Should only be used during development of the packages, the unipept-web-components package
# will be published on npm for production builds.

# This script assumes that the unipept-web-components project and the unipept project
# live in the same parent folder.

# First remove previously initiated content
rm -R node_modules/unipept-web-components

# Recreate an empty directory
mkdir node_modules/unipept-web-components

# Then, start a watcher that automatically applies changes made to the original web components into our local copy
# inside of node_modules
node link_with_web_components_watch.js
