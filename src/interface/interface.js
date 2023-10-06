/** @class */
class Interface {

    static get PROTOTYPE() {

        return Object.getOwnPropertyNames(this.prototype);
    }
}

module.exports = Interface;
