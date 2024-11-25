import {ref} from "vue";
import {BeliefPropagationResult} from "peptonizer/dist/types/GridSearchWorkerPool";
import {Peptonizer} from "peptonizer";

export default function usePeptonizerProcessor() {
    const process = async (
        peptides: string[]
    ): Promise<BeliefPropagationResult[]> => {
        const peptonizer = new Peptonizer();
    }
}
