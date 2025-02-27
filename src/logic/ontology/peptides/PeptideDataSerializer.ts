import Serializable from "shared-memory-datastructures/dist/encoding/Serializable";
import PeptideData from "./PeptideData";

export default class PeptideDataSerializer implements Serializable<PeptideData> {
    public decode(buffer: ArrayBuffer): PeptideData {
        return new PeptideData(buffer);
    }

    public encode(object: PeptideData): ArrayBuffer {
        return object.buffer;
    }
}
