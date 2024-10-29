import {defineStore} from "pinia";
import useEcOntology from "@/composables/new/ontology/useEcOntology";
import useGoOntology from "@/composables/new/ontology/useGoOntology";
import useInterproOntology from "@/composables/new/ontology/useInterproOntology";

const useOntologyStore = defineStore('ontologyStore', () => {
    const { ontology: ecOntology, update: updateEcOntology } = useEcOntology();
    const { ontology: goOntology, update: updateGoOntology } = useGoOntology();
    const { ontology: iprOntology, update: updateIprOntology } = useInterproOntology();

    const getEcDefinition = (code: string) => ecOntology.value.get(code);
    const getGoDefinition = (code: string) => goOntology.value.get(code);
    const getIprDefinition = (code: string) => iprOntology.value.get(code);

    return {
        getEcDefinition,
        getGoDefinition,
        getIprDefinition,
        updateEcOntology,
        updateGoOntology,
        updateIprOntology
    };
});

export default useOntologyStore;
