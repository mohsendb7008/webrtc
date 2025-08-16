class SlidingWindow {
    constructor(capacity = 10) {
        this.capacity = capacity;
        this.queue = [];
    }

    move(data) {
        if (this.queue.length == this.capacity) {
            this.queue.shift();
        }
        this.queue.push(data);
    }
}

module.exports = { SlidingWindow };