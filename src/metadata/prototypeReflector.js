const { prototype } = require("events");
const Reflector = require("./reflector");
const ReflectorContext = require("./reflectorContext");

/**
 *  PrototypeReflector focus on the prototype metadata of class/object
 */
class PrototypeReflector extends Reflector{

    /**@type {! metadata_t | property_metadata_t} */
    #metadata;

    #isDisposed;

    #isValid;

    get isDisposed() {

        return this.#isDisposed;
    }

    get metadata() {

        return super.isValidReflection ? this.#metadata : undefined;
    }

    get isValidReflection() {

        return this.#isValid;
    }

    get reflectionContext() {

        return this.#isValid ? ReflectorContext.PROTOTYPE : undefined;
    }

    constructor(target) {

        super(target);

        this.#init();
    }

    #init() {

        if (!super.isValidReflection || super.reflectionContext === ReflectorContext.OTHER || !super.metadata?.prototype) {

            this.#isValid = false;

            return;
        }

        this.#isValid = true;

        this.#metadata = super.metadata.prototype;

        this.#isDisposed = false;
    }

    _dispose() {

        this.#metadata = undefined;

        this.#isDisposed = true;
    }
}

module.exports = PrototypeReflector;