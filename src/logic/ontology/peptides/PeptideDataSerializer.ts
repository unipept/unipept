import PeptideData from "./PeptideData";
import {Serializable} from "shared-memory-datastructures";

export default class PeptideDataSerializer implements Serializable<PeptideData> {
    public decode(buffer: Uint8Array): PeptideData {
        return new PeptideData(new DataView(buffer.buffer));
    }

    public encode(object: PeptideData, destination: Uint8Array): number {
        destination.set(new Uint8Array(
            object.dataView.buffer,
            object.dataView.byteOffset,
            object.dataView.byteLength
        ));
        return object.dataView.byteLength;
    }

    public maximumLength(object: PeptideData): number {
        return object.dataView.byteLength;
    }
}
