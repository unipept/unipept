import {showNotification} from "./notifications.js";
import {DatasetManager} from "./mpa/datasetManager.js";
import {get, getJSON, highlight, logToGoogle, showError, showInfo} from "./utils.js";
import {LOCAL_STORAGE_TYPE, SESSION_STORAGE_TYPE} from "./mpa/storageTypeConstants";
import {LoadDatasetsCardManager} from "./mpa/loadDatasetsCardManager";

/* eslint-disable require-jsdoc */

function initDatasets() {
    let localStorageManager = new DatasetManager();
    let sessionStorageManager = new DatasetManager(SESSION_STORAGE_TYPE);

    let loadDatasetsCardManager = new LoadDatasetsCardManager(localStorageManager, sessionStorageManager);
}

export {initDatasets};
