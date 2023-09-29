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

    #originClass;

    #target;

    get target() {

        return this.#target;
    }

    get originClass() {

        return this.#originClass;
    }

    get reflectionContext() {

        return this.#context;
    }

    /**
     *  @description this property check if a particular (or related) abstract has the correct metadata on its blueprint
     */
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

        super();

        // if (typeof _unknown !== 'object') {

        //     this.#isValid = false;

        //     this.#isDisposed = true;

        //     return;
        // }

        this.#resolveMetadata(_unknown);

        this.#target = _unknown;
    }

    #resolveMetadata(_target) {

        if (isAbStract(_target)) {
            
            this.#metadata = getMetadata(_target);

            this.#context = ReflectorContext.ABSTRACT;

            this.#originClass = _target;

            return;
        }

        if (isAbStract(_target.constructor)) {
            
            this.#metadata = getMetadata(_target.constructor);

            this.#context = ReflectorContext.INSTANCE;

            this.#originClass = _target.constructor;

            return;
        }

        this.#isValid = false;
        this.#isDisposed = true;
    }

    hasProperty(_key) {

        contextMeta = this.ReflectorContext === ReflectorContext.ABSTRACT ? this.metadata.properties : this.metadata.prototype?.properties;

        return typeof contextMeta === 'object' && typeof contextMeta[_key] === 'object';
    }

    _dispose() {

        this.#metadata = undefined;

        this.#isDisposed = true;
    }
}

module.exports = Reflector;