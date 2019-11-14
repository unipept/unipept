import PeptideContainer from "unipept-web-components/src/logic/data-management/PeptideContainer";
import { ProcessedPeptideContainer } from "unipept-web-components/src/logic/data-management/ProcessedPeptideContainer";

import Worker from "worker-loader!./PeptideContainerProcessor.worker";
import ProgressPublisher from "unipept-web-components/src/logic/patterns/progress/ProgressPublisher";
import MPAConfig from "unipept-web-components/src/logic/data-management/MPAConfig";

// import "babel-polyfill"; // for async await support

export class PeptideContainerProcessor extends ProgressPublisher {
    private _worker: Worker;

    constructor() {
        super()
        this._worker = new Worker();
    }

    process(peptides: PeptideContainer, mpaConfig: MPAConfig, baseUrl: string) : Promise<ProcessedPeptideContainer> {
        return new Promise<ProcessedPeptideContainer>(resolve => {
            this._worker.onmessage = (event) => {
                switch (event.data.type) {
                    case "progress":
                        this.updateProgress(event.data.value);
                        break;
                    case "result":
                        // do this to preserve methods as methods aren't duplicated by the structured cloning algorithm used to pass worker messages
                        resolve(event.data.value as ProcessedPeptideContainer);
                        break;
                }
            };
            console.log(this._worker);
            console.log("POSTING MESSAGE");
            this._worker.postMessage({ peptides: peptides.getPeptides(), config: mpaConfig, baseUrl: baseUrl });
        });
    }
}
