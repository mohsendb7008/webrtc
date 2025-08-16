const { Uint16IdGenerator } = require("./Uint16IdGenerator");

describe('Test unit16 id generator', () => {
    test('Test some ids', () => {
        var pointer = 100;
        var generator = new Uint16IdGenerator(pointer);
        expect(generator.nextAvailableId()).toBe(pointer);
        expect(generator.nextAvailableId()).toBe((pointer + 1) % 65536);
        generator.acquireId(pointer);
        expect(generator.ids).toContain(pointer);
        expect(() => { generator.acquireId(pointer) }).toThrow();
        generator.releaseId(pointer);
        expect(generator.ids).not.toContain(pointer);
        expect(() => { generator.releaseId(pointer) }).toThrow();
        for(var i = 0; i < 65536; i++) {
            generator.acquireId(generator.nextAvailableId());
        }
        expect(() => { generator.nextAvailableId() }).toThrow();
        for(var i = 0; i < 65536; i++) {
            generator.releaseId(i);
        }
        expect(generator.ids.size).toBe(0);
    });
});