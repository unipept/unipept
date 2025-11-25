import PeptideDataV2 from "./PeptideDataV2";
import {Serializable} from "shared-memory-datastructures";
import PeptideDataV1 from "@/logic/ontology/peptides/PeptideDataV1";

export default class PeptideDataSerializerV1 implements Serializable<PeptideDataV1> {
    public decode(buffer: Uint8Array): PeptideDataV1 {
        return new PeptideDataV1(new DataView(buffer.buffer));
    }

    public encode(object: PeptideDataV1, destination: Uint8Array): number {
        const destinationView = new DataView(destination.buffer, destination.byteOffset, destination.byteLength);
        for (let i = 0; i < object.dataView.byteLength; i++) {
            destinationView.setUint8(i, object.dataView.getUint8(i));
        }
        return object.dataView.byteLength;
    }

    public maximumLength(object: PeptideDataV1): number {
        return object.dataView.byteLength;
    }
}
