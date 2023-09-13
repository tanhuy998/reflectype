const IDisposable = require('../libs/iDisposable.js');
const isAbStract = require('../utils/isAbstract.js');
const getMetadata = require('../reflection/getMetadata.js');
const ReflectorContext = require('./reflectorContext.js');

class Reflector extends IDisposable{

    /**@type {!Object} */
    #metadata;

    /**@type {boolean} */
    #isValid = true;

    /**@type {boolean} */
    #isDisposed = false;

    /**@type {keyof ReflectorContext} */
    #context;

    get reflectionContext() {

        return this.#context;
    }

    get isValidReflection() {

        return this.#isValid;
    }

    get metadata() {

        return this.#metadata;
    }

    get isDisposed() {

        return this.#isDisposed;
    }

    /**
     * 
     * @param {Object} _unknown 
     */
    constructor(_unknown) {

        if (typeof _unknown !== 'object') {

            this.#isValid = false;

            this.#isDisposed = true;

            return;
        }

        this.#resolveMetadata(_unknown);
    }

    #resolveMetadata(_target) {

        if (isAbStract(_target)) {

            this.#metadata = getMetadata(_target);

            this.#context = ReflectorContext.ABSTRACT;

            return;
        }

        if (typeof _target.constructor === 'function') {

            this.#metadata = getMetadata(_target.constructor);

            this.#context = ReflectorContext.INSTANCE;

            return;
        }

        this.#isValid = false;
    }

    _dispose() {

        delete this.#metadata;

        this.#isDisposed = true;
    }
}

module.exports = Reflector;