import PeptideDataV2 from "./PeptideDataV2";
import {Serializable} from "shared-memory-datastructures";
import PeptideDataV1 from "@/logic/ontology/peptides/PeptideDataV1";

export default class PeptideDataSerializerV2 implements Serializable<PeptideDataV2> {
    public decode(buffer: Uint8Array): PeptideDataV2 {
        return new PeptideDataV2(new DataView(buffer.buffer));
    }

    public encode(object: PeptideDataV2, destination: Uint8Array): number {
        const destinationView = new DataView(destination.buffer, destination.byteOffset, destination.byteLength);
        for (let i = 0; i < object.dataView.byteLength; i++) {
            destinationView.setUint8(i, object.dataView.getUint8(i));
        }
        return object.dataView.byteLength;
    }

    public maximumLength(object: PeptideDataV2): number {
        return object.dataView.byteLength;
    }
}
