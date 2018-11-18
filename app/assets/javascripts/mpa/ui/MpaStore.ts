import NewPeptideContainer from "../NewPeptideContainer";
import {ActionContext, ActionTree, GetterTree, MutationTree, StoreOptions} from "vuex";
import NewDatasetManager from "../NewDatasetManager";
import {StorageType} from "../StorageType";

export interface MpaState {
    selectedDatasets: NewPeptideContainer[],
    storedDatasets: NewPeptideContainer[]
}
