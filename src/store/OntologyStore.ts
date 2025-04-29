import {defineStore} from "pinia";
import useEcOntology from "@/composables/ontology/useEcOntology";
import useGoOntology from "@/composables/ontology/useGoOntology";
import useInterproOntology from "@/composables/ontology/useInterproOntology";
import useNcbiOntology from "@/composables/ontology/useNcbiOntology";

const useOntologyStore = defineStore('ontologyStore', () => {
    const { ontology: ecOntology, update: updateEcOntology } = useEcOntology();
    const { ontology: goOntology, update: updateGoOntology } = useGoOntology();
    const { ontology: iprOntology, update: updateIprOntology } = useInterproOntology();

    const { ontology: ncbiOntology, update: updateNcbiOntology } = useNcbiOntology();

    const getEcDefinition = (code: string) => ecOntology.get(code);
    const getGoDefinition = (code: string) => goOntology.get(code);
    const getIprDefinition = (code: string) => iprOntology.get(code);
    const getNcbiDefinition = (id: number) => ncbiOntology.get(id);

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
