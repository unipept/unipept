import {showNotification} from "./notifications.js";
import {DatasetManager} from "./mpa/datasetManager.js";
import {get, getJSON, highlight, logToGoogle, showError, showInfo} from "./utils.js";
import {LOCAL_STORAGE_TYPE, SESSION_STORAGE_TYPE} from "./mpa/storageTypeConstants";
import {LoadDatasetsCardManager} from "./mpa/loadDatasetsCardManager";

/* eslint-disable require-jsdoc */

function showSelectedDatasetsPlaceholder() {
    $("#selected-datasets-list").append($("<span>Please select one or more datasets from the right hand panel to continue the analysis...</span>"));
}

function renderSelectedDatasets(localStorageManager, sessionStorageManager) {
    let $body = $("#selected-datasets-list");
    $body.html("");

    console.log(localStorageManager);

    if (localStorageManager.getAmountOfSelectedDatasets() === 0 && sessionStorageManager.getAmountOfSelectedDatasets() === 0){
        showSelectedDatasetsPlaceholder();
    }
}

function renderSelectedDataset(dataset, secondaryActionCallback) {
    let $body = $("#selected-datasets-list");

    // Use jQuery to build elements and prevent XSS attacks
    let $listItem = $("<div class='list-item--two-lines'>");
    let $primaryContent = $("<span class='list-item-primary-content'>").append("<span>").text(dataset.getName());
    $primaryContent.append($("<span class='list-item-date'>").text(dataset.getDate()));
    $primaryContent.append($("<span class='list-item-body'>").text(dataset.getAmountOfPeptides() + " peptides"));
    $listItem.append($primaryContent);
    let $secondaryAction = $("<span class='list-item-secondary-action'>").append("<span class='glyphicon glyphicon-remove'>");
    $listItem.append($secondaryAction);

    $secondaryAction.click(secondaryActionCallback);

    $body.append($listItem);
}

function initDatasets() {
    let localStorageManager = new DatasetManager();
    let sessionStorageManager = new DatasetManager(SESSION_STORAGE_TYPE);

    let loadDatasetsCardManager = new LoadDatasetsCardManager(localStorageManager, sessionStorageManager);
    loadDatasetsCardManager.setClearRenderedDatasetsListener(renderSelectedDatasets);
    loadDatasetsCardManager.setRenderSelectedDataset(renderSelectedDataset)
}

export {initDatasets};
