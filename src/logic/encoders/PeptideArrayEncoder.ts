import {Serializable, StringEncoder} from "shared-memory-datastructures";

export default class PeptideArrayEncoder implements Serializable<string[]> {
    private readonly stringEncoder: StringEncoder = new StringEncoder();

    decode(buffer: Uint8Array): string[] {
        const joinedString = this.stringEncoder.decode(buffer);
        return joinedString.split(";");
    }

    encode(object: string[], destination: Uint8Array): number {
        return this.stringEncoder.encode(object.join(";"), destination);
    }

    maximumLength(object: string[]): number {
        // Since the strings where using only contain amino acids, we need a max of one byte per char
        return object.reduce((acc, s) => acc + s.length, 0) + Math.max(0, object.length - 1);
    }
}
