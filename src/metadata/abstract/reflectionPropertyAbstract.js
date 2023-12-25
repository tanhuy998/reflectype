const Reflection = require("../reflection.js");
const {resolvePropertyMetadata, checkPropertyDescriptorState} = require('../trait/traitPropertyReflection.js');

module.exports = class ReflectionPropertyAbstract extends Reflection {

    #name;

    get name() {

        return this.#name;
    }

    get isWritable() {

        return checkPropertyDescriptorState.call(this, 'writable');
    }

    get isEnumerable() {

        return checkPropertyDescriptorState.call(this, 'enumerable');
    }

    get isConfigurable() {

        return checkPropertyDescriptorState.call(this, 'configurable')
    }

    constructor(target, propName) {

        super(target);

        this.#name = propName;

        this.#init();
    }

    #init() {

        const type = typeof this.#name;

        if (!this.#name || type !== 'string' && type !== 'symbol') {

            throw new TypeError('invalid type of _attribute parameter');
        }
    }
}