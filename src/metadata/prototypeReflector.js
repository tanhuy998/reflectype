const { prototype } = require("events");
const Reflector = require("./reflector");

class PrototypeReflector extends Reflector{

    #metadata;

    #isDisposed;


    get isDisposed() {

        return 
    }

    get metadata() {

        return super.isValidReflection ? this.#metadata : undefined;
    }

    get isValidReflection() {

        return (super.isValidReflection && this.#metadata);
    }

    constructor(target) {

        super(target);

        this.#init();

        super._dispose();
    }

    #init() {

        if (!super.isValidReflection) {

            return;
        }

        if (!super.metadata.prototype) {

            return;
        }

        this.#metadata = super.metadata.prototype;

        this.isDisposed = false;
    }

    _dispose() {

        this.#metadata = undefined;

        this.#isDisposed = true;
    }
}

module.exports = PrototypeReflector;