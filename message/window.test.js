const { SlidingWindow } = require("./window");

describe('Test sliding window', () => {
    test('Test move', () => {
        let window = new SlidingWindow(2);
        expect(window.queue.join(',')).toBe('');
        window.move(1);
        expect(window.queue.join(',')).toBe('1');
        window.move(2);
        expect(window.queue.join(',')).toBe('1,2');
        window.move(3);
        expect(window.queue.join(',')).toBe('2,3');
        window.move(4);
        expect(window.queue.join(',')).toBe('3,4');
    });
});