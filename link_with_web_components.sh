#! /bin/bash

# ONLY USE DURING DEVELOPMENT
# This is an utility script that can be used to link the unipept-web-components repository with
# this repository so that changes in the web-components are directly reflected in this project.
# Should only be used during development of the packages, the unipept-web-components package
# will be published on npm for production builds.

# This script assumes that the unipept-web-components project and the unipept project
# live in the same parent folder.

# First remove the original dist data and link both together
rm -f ./node_modules/unipept-web-components/dist/unipept-web-components.umd.min.js

# Then, start a watcher that automatically applies changes made to the original web components into our local copy
# inside of node_modules
node link_with_web_components_watch.js
#ln -s ../unipept-web-components/dist/unipept-web-components.umd.min.js ./node_modules/unipept-web-components/dist/unipept-web-components.umd.min.js



