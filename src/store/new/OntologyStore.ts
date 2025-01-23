import {defineStore} from "pinia";
import useEcOntology from "@/composables/new/ontology/useEcOntology";
import useGoOntology from "@/composables/new/ontology/useGoOntology";
import useInterproOntology from "@/composables/new/ontology/useInterproOntology";
import useNcbiOntology from "@/composables/new/ontology/useNcbiOntology";

const useOntologyStore = defineStore('ontologyStore', () => {
    const { ontology: ecOntology, update: updateEcOntology } = useEcOntology();
    const { ontology: goOntology, update: updateGoOntology } = useGoOntology();
    const { ontology: iprOntology, update: updateIprOntology } = useInterproOntology();

    const { ontology: ncbiOntology, update: updateNcbiOntology } = useNcbiOntology();

    const getEcDefinition = (code: string) => ecOntology.value.get(code);
    const getGoDefinition = (code: string) => goOntology.value.get(code);
    const getIprDefinition = (code: string) => iprOntology.value.get(code);
    const getNcbiDefinition = (id: number) => ncbiOntology.value.get(id);

    return {
        getEcDefinition,
        getGoDefinition,
        getIprDefinition,
        getNcbiDefinition,
        updateEcOntology,
        updateGoOntology,
        updateIprOntology,
        updateNcbiOntology,
        ecOntology,
        goOntology,
        iprOntology,
        ncbiOntology
    };
});

export default useOntologyStore;
