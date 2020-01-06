/**
 * This file watches the original Unipept web components directory for changes and automatically applies these changes
 * to the local copy of the Unipept web components (inside the node_modules folder).
 * 
 * This script is only here for use during development of Unipept and should not be used in the production environment.
 * The package Chokidar is required to run this file.
 */

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

const directory = './../unipept-web-components'

const errHandler = function(err) {
    if (err) {
        console.error(err);
    }
}

console.log("Watching file system for changes...");

// Watch for changes to the web components directory.
chokidar.watch(directory).on('all', (event, currentPath) => {
    if (!currentPath.includes('/node_modules') && !currentPath.includes('/.git')) {
        const filteredPath = currentPath.replace('../unipept-web-components', './node_modules/unipept-web-components');
        const directory = path.dirname(filteredPath);
        switch(event) {
            case 'add':
                fs.mkdirSync(directory, { recursive: true }, errHandler);
                fs.copyFile(currentPath, filteredPath, errHandler);
                break;
            case 'change':
                fs.copyFile(currentPath, filteredPath, errHandler);
                break;
            case 'unlink':
                fs.unlink(filteredPath, errHandler);
                break;
        }
        console.log(event, currentPath);
    }
});
