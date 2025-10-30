import {defineStore} from "pinia";
import useSampleData from "@/composables/communication/unipept/useSampleData";

const useSampleDataStore = () => defineStore(`sampleDataStore`, () => {
    const { samples, process: processSampleData } = useSampleData();

    const loadSampleData = async () => {
        await processSampleData();
    }

    return {
        samples,

        loadSampleData
    }
})();

export type SampleDataStore = ReturnType<typeof useSampleDataStore>;

export default useSampleDataStore;
