const { MutableView } = require("./view");

describe('Test mutable view', () => {
    test('Test seek', () => {
        let view = new MutableView(new DataView(new ArrayBuffer(2)));
        view.setInt8(0, 10);
        view.setInt8(1, 20);
        expect(view.getInt8(0)).toBe(10);
        expect(view.getInt8(1)).toBe(20);
        view.seek(1);
        expect(view.getInt8(0)).toBe(20);
        expect(() => view.getInt8(1)).toThrow();
        view.seek(1);
        expect(() => view.getInt8(0)).toThrow();
        expect(() => view.seek(1)).toThrow();
    });
    test('Test read write int', () => {
        let view = new DataView(new ArrayBuffer(6));
        let wView = new MutableView(view);
        wView.writeInt8(127);
        wView.writeUint8(255);
        wView.writeInt16(32767);
        wView.writeUint16(65535);
        let rView = new MutableView(view);
        expect(rView.readInt8()).toBe(127);
        expect(rView.readUint8()).toBe(255);
        expect(rView.readInt16()).toBe(32767);
        expect(rView.readUint16()).toBe(65535);
    });
    test('Test read write bytes', () => {
        let data = [-128, -1, 0, 1, 127];
        let view = new DataView(new ArrayBuffer(data.length + 2));
        let wView = new MutableView(view);
        wView.writeBytes(data);
        let rView = new MutableView(view);
        expect(rView.readBytes().join(',')).toBe(data.join(','));
    });
    test('Test read write string', () => {
        let text = 'some random text';
        let view = new DataView(new ArrayBuffer(text.length + 2));
        let wView = new MutableView(view);
        wView.writeString(text);
        let rView = new MutableView(view);
        expect(rView.readString()).toBe(text);
    });
});