import {ref} from "vue";
import UnipeptAnalysisProgressListener from "@/logic/processors/peptonizer/PeptonizerProgressListener";

export default function usePeptonizerAnalysisProgress() {
    const currentProgress = ref<number>(0);
    const etaSeconds = ref<number>(0);
    const started = ref<boolean>(false);
    const initializationFinished = ref<boolean>(false);
    const finished = ref<boolean>(false);

    const createListener = () => {
        return new UnipeptAnalysisProgressListener(
            currentProgress,
            etaSeconds,
            started,
            initializationFinished,
            finished
        );
    };

    return {
        currentProgress,
        etaSeconds,
        started,
        initializationFinished,
        finished,
        createListener
    };
}