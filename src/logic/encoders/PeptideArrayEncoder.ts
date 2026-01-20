import {Serializable, StringEncoder} from "shared-memory-datastructures";

export default class PeptideArrayEncoder implements Serializable<string[]> {
    private readonly stringEncoder: StringEncoder = new StringEncoder();

    decode(buffer: Uint8Array): string[] {
        const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        const length = Number(view.getBigUint64(0));

        if (length === 0) {
            return [];
        }

        const joinedString = this.stringEncoder.decode(buffer.subarray(8));
        return joinedString.split(";");
    }

    encode(object: string[], destination: Uint8Array): number {
        const view = new DataView(destination.buffer, destination.byteOffset, destination.byteLength);
        view.setBigUint64(0, BigInt(object.length));

        if (object.length === 0) {
            return 8;
        }

        const stringBytesWritten = this.stringEncoder.encode(object.join(";"), destination.subarray(8));
        return 8 + stringBytesWritten;
    }

    maximumLength(object: string[]): number {
        if (object.length === 0) {
            return 8;
        }
        // Since the strings where using only contain amino acids, we need a max of one byte per char
        return 8 + object.reduce((acc, s) => acc + s.length, 0) + Math.max(0, object.length - 1);
    }
}