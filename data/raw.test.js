const { RawData } = require("./raw");
const { dataTypes } = require("./type");
const { MutableView } = require("./view");

describe('Test raw data', () => {
    test('Test type', () => {
        expect(RawData.TYPE).toBe(dataTypes.RAW);
    });
    test('Test serialize', () => {
        let rawData = new RawData([2, 128, -5, 255]);
        let buffer = new ArrayBuffer(rawData.length() + 2);
        let view1 = new DataView(buffer);
        let view2 = new DataView(buffer, 1, 6);
        rawData.serialize(new MutableView(view2));
        expect(view1.getInt16(1)).toBe(4); // length of bytes
        expect(view1.getInt8(3)).toBe(2);
        expect(view1.getInt8(4)).toBe(-128); // signed byte value for 128
        expect(view1.getInt8(5)).toBe(-5);
        expect(view1.getInt8(6)).toBe(-1); // signed byte value for 255
    });
    test('Test deserialize', () => {
        let buffer = new ArrayBuffer(8);
        let view1 = new DataView(buffer);
        view1.setInt16(1, 4);
        view1.setInt8(3, -1);
        view1.setInt8(4, 0);
        view1.setInt8(5, 127);
        view1.setInt8(6, 128);
        let view2 = new DataView(buffer, 1, 6);
        let rawData = new RawData();
        rawData.deserialize(new MutableView(view2))
        expect(rawData.length()).toBe(6); // 2 bytes for bytes length
        expect(rawData.data.length).toBe(4);
        expect(rawData.data[0]).toBe(-1);
        expect(rawData.data[1]).toBe(0);
        expect(rawData.data[2]).toBe(127);
        expect(rawData.data[3]).toBe(-128); // signed byte value for 128
    });
});