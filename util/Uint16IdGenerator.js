class Uint16IdGenerator {
    constructor(idPointer = 0) {
        this.idPointer = idPointer;
        this.ids = new Set();
    }

    nextAvailableId() {
        for (var i = 0; i < 65536; i++) {
            var id = (this.idPointer + i) % 65536;
            if (!this.ids.has(id)) {
                this.idPointer = (id + 1) % 65536;
                return id;
            }
        }
        throw new Error('No available ids');
    }

    acquireId(id) {
        if (this.ids.has(id)) {
            throw new Error('Id is already acquired');
        }
        this.ids.add(id);
    }

    releaseId(id) {
        if (!this.ids.has(id)) {
            throw new Error('Id is already released');
        }
        this.ids.delete(id);
    }
}

module.exports = { Uint16IdGenerator };