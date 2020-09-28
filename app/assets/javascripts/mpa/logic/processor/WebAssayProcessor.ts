import {
    ProgressListener,
    CommunicationSource,
    ProteomicsAssay,
    Peptide,
    CountTable,
    Pept2DataCommunicator,
    PeptideTrust,
    AssayProcessor,
    PeptideData,
    NetworkConfiguration, DefaultCommunicationSource
} from "unipept-web-components";
import WebCommunicationSource from "./../communication/WebCommunicationSource";

export default class WebAssayProcessor implements AssayProcessor {
    private pept2DataCommunicator: Pept2DataCommunicator;
    private cancelled: boolean = false;

    constructor(
        private readonly assay: ProteomicsAssay,
        private readonly progressListener?: ProgressListener
    ) {}

    public cancel(): void {
        this.cancelled = true;
        if (this.pept2DataCommunicator) {
            this.pept2DataCommunicator.cancel();
        }
    }

    public isCancelled(): boolean {
        return this.cancelled;
    }

    public async processAssay(countTable: CountTable<Peptide>): Promise<CommunicationSource> {
        // We need to reprocess this assay and store the results in the database.
        // Process assay and write results to database.
        const pept2DataProgressNotifier: ProgressListener = {
            onProgressUpdate: (val: number) => this.setProgress(val)
        }

        this.pept2DataCommunicator = new Pept2DataCommunicator();

        // Preload all data for this assay
        await this.pept2DataCommunicator.process(
            countTable,
            this.assay.getSearchConfiguration(),
            pept2DataProgressNotifier
        );

        this.setProgress(1);
        return new WebCommunicationSource(this.pept2DataCommunicator);
    }

    private setProgress(value: number) {
        if (this.progressListener) {
            this.progressListener.onProgressUpdate(value);
        }
    }
}
