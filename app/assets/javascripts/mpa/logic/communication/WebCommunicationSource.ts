import { DefaultCommunicationSource, Pept2DataCommunicator } from "unipept-web-components";

export default class WebCommunicationSource extends DefaultCommunicationSource {
    constructor(
        private readonly pept2DataCommunicator: Pept2DataCommunicator
    ) {
        super();
    }

    public getPept2DataCommunicator(): Pept2DataCommunicator {
        return this.pept2DataCommunicator;
    }
}
