import {showNotification} from "./notifications.js";
import DatasetManager from "./mpa/datasetManager";
import {get, getJSON, highlight, logToGoogle, showError, showInfo} from "./utils.js";
import {LOCAL_STORAGE_TYPE, SESSION_STORAGE_TYPE} from "./mpa/storageTypeConstants";
import {LoadDatasetsCardManager} from "./mpa/loadDatasetsCardManager";

/* eslint-disable require-jsdoc */

function showSelectedDatasetsPlaceholder() {
    $("#selected-datasets-list").append($("<span id='selected-datasets-placeholder'>Please select one or more datasets from the right hand panel to continue the analysis...</span>"));
}

function clearSelectedDatasets() {
    $("#selected-datasets-list").html("");
    showSelectedDatasetsPlaceholder();
}

function removeSelectedDataset(dataset) {
    $("#list-item-dataset-" + dataset.getId()).remove();
    // Check if there are more datasets in the list
    if ($(".dataset-list-item").length === 0) {
        showSelectedDatasetsPlaceholder();
    }
}

function addSelectedDataset(dataset, secondaryActionCallback) {
    if ($("#list-item-dataset-" + dataset.getId()).length > 0) {
        return;
    }

    $("#selected-datasets-placeholder").remove();

    let $body = $("#selected-datasets-list");

    // Use jQuery to build elements and prevent XSS attacks
    let $listItem = $("<div class='list-item--two-lines dataset-list-item' id='list-item-dataset-" + dataset.getId() + "'>");
    let $primaryContent = $("<span class='list-item-primary-content'>").append("<span>").text(dataset.getName());
    $primaryContent.append($("<span class='list-item-date'>").text(dataset.getDateFormatted()));
    $primaryContent.append($("<span class='list-item-body'>").text(dataset.getAmountOfPeptides() + " peptides"));
    $listItem.append($primaryContent);
    let $secondaryAction = $("<span class='list-item-secondary-action'>").append("<span class='glyphicon glyphicon-trash'>");
    $listItem.append($secondaryAction);

    $secondaryAction.click(secondaryActionCallback);

    $body.append($listItem);
}

function initDatasets() {
    let localStorageManager = new DatasetManager();
    let sessionStorageManager = new DatasetManager(SESSION_STORAGE_TYPE);

    showSelectedDatasetsPlaceholder();

    let loadDatasetsCardManager = new LoadDatasetsCardManager(
        localStorageManager,
        sessionStorageManager,
        clearSelectedDatasets,
        removeSelectedDataset,
        addSelectedDataset
    );
}

export {initDatasets};
