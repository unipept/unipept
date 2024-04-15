import { defineStore } from "pinia"
import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { Assay } from "unipept-web-components";

const findAssayIndex = (assay: Assay, list: Assay[]): number => {
    if(!assay) {
        return -1;
    }

    return list.findIndex((value: Assay) => {
        return value.name === assay.name
    });
}

const useAssays = defineStore('assays', () => {
    const assays = useLocalStorage('web-assays', [] as Assay[]);

    // Getters
    const empty = computed(() => assays.value.length === 0);

    // Mutations
    const add = (assay: Assay) => {
        if(findAssayIndex(assay, assays.value) === -1) {
            assays.value.push(assay);
        }
    };

    const remove = (assay: Assay) => {
        const idx = findAssayIndex(assay, assays.value);

        if(idx !== -1) {
            assays.value.splice(idx, 1);
        }
    };

    return {
        assays,
        empty,
        add,
        remove,
    }
});

export default useAssays;
