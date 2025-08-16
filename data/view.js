class MutableView {
    static INT8_NUM_BYTES = 1;
    static INT16_NUM_BYTES = 2;
    static ARRAY_LEN_NUM_BYTES = 2;
    static STRING_LEN_NUM_BYTES = 2;

    constructor(view) {
        this.view = view;
    }

    getInt8(i) {
        return this.view.getInt8(i);
    }

    setInt8(i, v) {
        this.view.setInt8(i, v);
    }

    getUint8(i) {
        return this.view.getUint8(i);
    }

    setUint8(i, v) {
        this.view.setUint8(i, v);
    }

    getInt16(i) {
        return this.view.getInt16(i);
    }

    setInt16(i, v) {
        this.view.setInt16(i, v);
    }

    getUint16(i) {
        return this.view.getUint16(i);
    }

    setUint16(i, v) {
        this.view.setUint16(i, v);
    }

    seek(amount) {
        if (amount > this.view.byteLength) {
            throw new Error('Cannot seek more than data length')
        }
        this.view = new DataView(this.view.buffer, this.view.byteOffset + amount, this.view.byteLength - amount);
    }

    readInt8() {
        var x = this.getInt8(0);
        this.seek(MutableView.INT8_NUM_BYTES);
        return x;
    }

    writeInt8(x) {
        this.setInt8(0, x);
        this.seek(MutableView.INT8_NUM_BYTES);
    }

    readUint8() {
        var x = this.getUint8(0);
        this.seek(MutableView.INT8_NUM_BYTES);
        return x;
    }

    writeUint8(x) {
        this.setUint8(0, x);
        this.seek(MutableView.INT8_NUM_BYTES);
    }

    readInt16() {
        var x = this.getInt16(0);
        this.seek(MutableView.INT16_NUM_BYTES);
        return x;
    }

    writeInt16(x) {
        this.setInt16(0, x);
        this.seek(MutableView.INT16_NUM_BYTES);
    }

    readUint16() {
        var x = this.getUint16(0);
        this.seek(MutableView.INT16_NUM_BYTES);
        return x;
    }

    writeUint16(x) {
        this.setUint16(0, x);
        this.seek(MutableView.INT16_NUM_BYTES);
    }

    readBytes() {
        let length = this.readInt16();
        let bytes = new Int8Array(length);
        for (let i = 0; i < length; i++) {
            bytes[i] = this.readInt8();
        }
        return bytes;
    }

    writeBytes(bytes) {
        this.writeInt16(bytes.length);    
        for (let i = 0; i < bytes.length; i++) {
            this.writeInt8(bytes[i]);
        }
    }

    readString() {
        let length = this.readInt16();
        let bytes = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            bytes[i] = this.readUint8();
        }
        let decoder = new TextDecoder();
        return decoder.decode(bytes);
    }

    writeString(string) {
        let encoder = new TextEncoder();
        let bytes = encoder.encode(string);
        this.writeInt16(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            this.writeUint8(bytes[i]);
        }
    }
}

module.exports = { MutableView };