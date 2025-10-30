import PeptideData from "./PeptideData";
import {Serializable} from "shared-memory-datastructures";

export default class PeptideDataSerializer implements Serializable<PeptideData> {
    public decode(buffer: Uint8Array): PeptideData {
        return new PeptideData(new DataView(buffer.buffer));
    }

    public encode(object: PeptideData, destination: Uint8Array): number {
        const destinationView = new DataView(destination.buffer, destination.byteOffset, destination.byteLength);
        for (let i = 0; i < object.dataView.byteLength; i++) {
            destinationView.setUint8(i, object.dataView.getUint8(i));
        }
        return object.dataView.byteLength;
    }

    public maximumLength(object: PeptideData): number {
        return object.dataView.byteLength;
    }
}
