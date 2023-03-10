import { defineStore } from "pinia";

const useConfigurationStore = defineStore('configuration', () => {
    // UNIPEPT
    const unipeptApiUrl = 'https://api.unipept.ugent.be';

    const parallelRequests = 5;

    const peptideDataBatchSize  = 100;
    const cleavageBatchSize     = 10;
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
