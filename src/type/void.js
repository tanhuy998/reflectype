module.exports = class Void {

    constructor() {

        throw new Error('[Void] prevents being instantiation');
    }
}

