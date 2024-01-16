const self = require('../utils/self');

/** @class */
class Interface {

    static get PROTOTYPE() {

        return Object.getOwnPropertyNames(this.prototype);
    }

    constructor() {

        throw new Error(`could not instantiate [${self(this)}] that inherits [Interface]`);
    }
}

module.exports = Interface;
