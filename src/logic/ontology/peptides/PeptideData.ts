import PeptideDataResponse from "./PeptideDataResponse";

export default class PeptideData {
    // Offsets and lengths of the data fields in bytes.
    public static readonly LCA_OFFSET: number = 0;
    public static readonly LCA_SIZE: number = 4;

    // At what position in the array is the lineage length stored?
    public static readonly LINEAGE_COUNT_OFFSET: number = PeptideData.LCA_OFFSET + PeptideData.LCA_SIZE;
    // How many bytes are reserved to store the lineage array length?
    public static readonly LINEAGE_COUNT_SIZE: number = 4;
    // At what position in the data array does the lineage array start?
    public static readonly LINEAGE_ARRAY_INDEX_OFFSET: number = PeptideData.LINEAGE_COUNT_OFFSET + PeptideData.LINEAGE_COUNT_SIZE;
    // How many bytes are reserved to store each lineage value?
    public static readonly LINEAGE_ARRAY_POINTER_SIZE: number = 4;

    // How many bytes are reserved for the counts of each functional annotation type?
    public static readonly FA_COUNT_SIZE = 4;

    // At what offset in the array do the functional annotation counts start?
    public static readonly FA_ALL_COUNT_OFFSET = PeptideData.LINEAGE_ARRAY_INDEX_OFFSET + PeptideData.LINEAGE_ARRAY_POINTER_SIZE;
    public static readonly FA_EC_COUNT_OFFSET = PeptideData.FA_ALL_COUNT_OFFSET + PeptideData.FA_COUNT_SIZE;
    public static readonly FA_GO_COUNT_OFFSET = PeptideData.FA_EC_COUNT_OFFSET + PeptideData.FA_COUNT_SIZE;
    public static readonly FA_IPR_COUNT_OFFSET = PeptideData.FA_GO_COUNT_OFFSET + PeptideData.FA_COUNT_SIZE;

    // How many bytes are reserved for a pointer to the different start positions in the data portion of the array?
    public static readonly FA_POINTER_SIZE = 4;

    // Pointers to the positions in the variable length data portion of the array for each of the FA types.
    public static readonly FA_EC_INDEX_OFFSET = PeptideData.FA_IPR_COUNT_OFFSET + PeptideData.FA_COUNT_SIZE;
    public static readonly FA_GO_INDEX_OFFSET = PeptideData.FA_EC_INDEX_OFFSET + PeptideData.FA_POINTER_SIZE;
    public static readonly FA_IPR_INDEX_OFFSET = PeptideData.FA_GO_INDEX_OFFSET + PeptideData.FA_POINTER_SIZE;

    // Where does the variable length data portion of the array start?
    public static readonly DATA_START = PeptideData.FA_IPR_INDEX_OFFSET + PeptideData.FA_POINTER_SIZE;

    private readonly dataView: DataView;

    constructor(
        public readonly buffer: ArrayBuffer
    ) {
        this.dataView = new DataView(buffer);
    }

    public static createFromPeptideDataResponse(response: PeptideDataResponse): PeptideData {
        const gos = response.fa.data ? Object.keys(response.fa.data).filter(
            code => code.startsWith("GO:")
        ) : [];
        const iprs = response.fa.data ? Object.keys(response.fa.data).filter(
            code => code.startsWith("IPR:")
        ) : [];
        const ecs = response.fa.data ? Object.keys(response.fa.data).filter(
            code => code.startsWith("EC:")
        ) : [];

        const lineageDataLength = PeptideData.LINEAGE_COUNT_SIZE + response.lineage.length * 4;
        // We need 12 bytes to record the length of each of the functional annotation arrays.
        // GO is stored as an integer (4 bytes) and it's count (4 bytes for count)
        // IPR is stored as an integer (4 bytes) and it's count (4 bytes)
        // EC is stored as 4 integers (4 bytes) and it's count (4 bytes)
        const faDataLength = 12 + gos.length * 8 + iprs.length * 8 + ecs.length * 20;
        const bufferLength = PeptideData.DATA_START + lineageDataLength + faDataLength;

        const dataBuffer = new ArrayBuffer(bufferLength);

        // Now convert all the data into a binary format
        const dataView = new DataView(dataBuffer);
        dataView.setUint32(this.LCA_OFFSET, response.lca);

        // Keep track of the length of the lineage array
        dataView.setUint32(this.LINEAGE_COUNT_OFFSET, response.lineage.length);

        dataView.setUint32(this.FA_ALL_COUNT_OFFSET, response.fa.counts.all);
        dataView.setUint32(this.FA_GO_COUNT_OFFSET, response.fa.counts.GO);
        dataView.setUint32(this.FA_IPR_COUNT_OFFSET, response.fa.counts.IPR);
        dataView.setUint32(this.FA_EC_COUNT_OFFSET, response.fa.counts.EC);

        // First, convert lineage to binary format
        // Keep track of which position in the variable length data array the lineage starts
        dataView.setUint32(PeptideData.LINEAGE_ARRAY_INDEX_OFFSET, this.DATA_START);
        let currentPos = this.DATA_START;

        for (let i = 0; i < response.lineage.length; i++) {
            dataView.setInt32(
                currentPos,
                response.lineage[i] !== null ? response.lineage[i]! : 0
            );

            currentPos += 4;
        }

        // First convert EC-numbers to binary format
        // Keep track of where the EC-numbers encoding starts.
        dataView.setUint32(this.FA_EC_INDEX_OFFSET, currentPos);
        // Keep track of how many EC-numbers are encoded.
        dataView.setUint32(currentPos, ecs.length);
        currentPos += 4;
        for (const ec of ecs) {
            const parts = ec.replace("EC:", "").split(".");
            // Encode null-values as -1
            dataView.setInt32(currentPos, parts[0] !== "-" ? parseInt(parts[0]) : -1);
            dataView.setInt32(currentPos + 4, parts[1] !== "-" ? parseInt(parts[1]) : -1);
            dataView.setInt32(currentPos + 8, parts[2] !== "-" ? parseInt(parts[2]) : -1);
            dataView.setInt32(currentPos + 12, parts[3] !== "-" ? parseInt(parts[3]) : -1);
            dataView.setUint32(currentPos + 16, response.fa.data[ec]);
            currentPos += 20;
        }

        // Now convert GO-terms to binary format
        // Keep track of where the GO-terms encoding starts.
        dataView.setUint32(this.FA_GO_INDEX_OFFSET, currentPos);
        // Keep track of how many GO-terms are encoded.
        dataView.setUint32(currentPos, gos.length);
        currentPos += 4;
        for (const go of gos) {
            dataView.setUint32(currentPos, parseInt(go.replace("GO:", "")));
            dataView.setUint32(currentPos + 4, response.fa.data[go]);
            currentPos += 8;
        }

        // Now convert IPR-terms to binary format
        // Keep track of where the IPR-terms encoding starts.
        dataView.setUint32(this.FA_IPR_INDEX_OFFSET, currentPos);
        // Keep track of how many IPR-terms are encoded.
        dataView.setUint32(currentPos, iprs.length);
        currentPos += 4;
        for (const ipr of iprs) {
            dataView.setUint32(currentPos, parseInt(ipr.replace("IPR:IPR", "")));
            dataView.setUint32(currentPos + 4, response.fa.data[ipr]);
            currentPos += 8;
        }

        return new PeptideData(dataBuffer);
    }

    public get faCounts(): { all: number, ec: number, go: number, ipr: number } {
        return {
            all: this.dataView.getUint32(PeptideData.FA_ALL_COUNT_OFFSET),
            ec: this.dataView.getUint32(PeptideData.FA_EC_COUNT_OFFSET),
            go: this.dataView.getUint32(PeptideData.FA_GO_COUNT_OFFSET),
            ipr: this.dataView.getUint32(PeptideData.FA_IPR_COUNT_OFFSET)
        }
    }

    public get lca(): number {
        return this.dataView.getUint32(PeptideData.LCA_OFFSET);
    }

    public get lineage(): (number | null)[] {
        const length = this.dataView.getUint32(PeptideData.LINEAGE_COUNT_OFFSET);
        const lineagePointer = this.dataView.getUint32(PeptideData.LINEAGE_ARRAY_INDEX_OFFSET);

        const lin = [];
        for (let i = 0; i < length; i++) {
            const val = this.dataView.getInt32(lineagePointer + i * 4);
            if (val === 0) {
                lin.push(null);
            } else {
                lin.push(val);
            }
        }
        return lin;
    }

    public get ec(): any {
        const output = {};

        let ecStart = this.dataView.getUint32(PeptideData.FA_EC_INDEX_OFFSET);
        const ecLength = this.dataView.getUint32(ecStart);

        ecStart += 4;

        // Decode each of the EC numbers
        for (let i = 0; i < ecLength; i++) {
            const part1 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart));
            const part2 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart + 4));
            const part3 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart + 8));
            const part4 = this.encodedNullOrNumberToString(this.dataView.getInt32(ecStart + 12));

            // @ts-ignore: variable indexing
            output[`EC:${part1}.${part2}.${part3}.${part4}`] = this.dataView.getUint32(ecStart + 16);

            ecStart += 20;
        }

        return output;
    }

    private encodedNullOrNumberToString(value: number): string {
        if (value === -1) {
            return "-";
        } else {
            return value.toString();
        }
    }

    public get go(): any {
        const output = {};

        let goStart = this.dataView.getUint32(PeptideData.FA_GO_INDEX_OFFSET);
        const goLength = this.dataView.getUint32(goStart);

        goStart += 4;

        // Decode each of the GO terms
        for (let i = 0; i < goLength; i++) {
            const term = this.dataView.getUint32(goStart);

            // @ts-ignore: variable indexing
            output[
            "GO:" + leftPad(term.toString(), "0", 7)
                ] = this.dataView.getUint32(goStart + 4);

            goStart += 8;
        }

        return output;
    }

    public get ipr(): any {
        const output = {};

        let iprStart = this.dataView.getUint32(PeptideData.FA_IPR_INDEX_OFFSET);
        const iprLength = this.dataView.getUint32(iprStart);

        iprStart += 4;

        // Decode each of the GO terms
        for (let i = 0; i < iprLength; i++) {
            const term = this.dataView.getUint32(iprStart);

            // @ts-ignore: variable indexing
            output[
            "IPR:IPR" + leftPad(term.toString(), "0", 6)
                ] = this.dataView.getUint32(iprStart + 4);

            iprStart += 8;
        }

        return output;
    }


    public toPeptideDataResponse(): PeptideDataResponse {
        const faCounts = this.faCounts;

        const dataObject = {};
        Object.assign(dataObject, this.go);
        Object.assign(dataObject, this.ec);
        Object.assign(dataObject, this.ipr);

        return {
            lca: this.lca,
            lineage: this.lineage,
            fa: {
                counts: {
                    all: faCounts.all,
                    EC: faCounts.ec,
                    GO: faCounts.go,
                    IPR: faCounts.ipr
                },
                data: dataObject
            }
        }
    }
}

const leftPad = (str: string, character: string, len: number): string => {
    const numberOfChars = len - str.length;
    let chars = "";
    for (let i = 0; i < numberOfChars; i++) {
        chars += character;
    }
    return chars + str;
}
