import { defineStore } from "pinia";

const useConfigurationStore = defineStore('configuration', () => {
    // UNIPEPT
    const unipeptApiUrl = 'https://api.unipept.ugent.be';

    const parallelRequests = 5;
    const taskQueueSize = 4;

    const peptideDataBatchSize  = 200;
    const cleavageBatchSize     = 200;
    const goBatchSize           = 100;
    const ecBatchSize           = 100;
    const interproBatchSize     = 100;
    const ncbiBatchSize         = 100;

    // PRIDE
    const prideApiPeptideUrl = 'https://www.ebi.ac.uk/pride/ws/archive/v2/peptideevidences';
    const prideBatchSize = 1000;

    return {
        unipeptApiUrl,
        parallelRequests,
        taskQueueSize,
        peptideDataBatchSize,
        cleavageBatchSize,
        goBatchSize,
        ecBatchSize,
        interproBatchSize,
        ncbiBatchSize,

        prideApiPeptideUrl,
        prideBatchSize,
    };
});

export default useConfigurationStore;
