export class ArrayBufferUtils {
    public static arrayBufferToShared(buffer: ArrayBuffer): SharedArrayBuffer {
        const sharedBuffer = new SharedArrayBuffer(buffer.byteLength);
        new Uint8Array(sharedBuffer).set(new Uint8Array(buffer));
        return sharedBuffer;
    }
}
