const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { isObject } = require("../../libs/type");
const Reflection = require("../reflection");

module.exports = class AbstractReflection extends Reflection {

    #options;

    #metadata;

    #isValid;

    get metadata() {

        return this.#metadata;
    }

    get isValid() {

        return this.#isValid;
    }

    get options() {

        return this.#options;
    }

    constructor(target, ...options) {

        super(target);

        preventNonInheritanceTakeEffect.call(this, AbstractReflection);

        this.#options = options;

        this.#init(); 
    }

    #init() {

        if (!super.isValidReflection) {

            return;
        }

        if (!this._meetPrerequisite()) {

            this.#isValid = false;
            return;
        }

        this.#metadata = this._resolveAspectOfReflection();
        this.#isValid = isObject(this.#metadata);
    }

    __dispose() {

        this.#metadata = undefined;
        this.reflector._dispose();
    }

    _resolveAspectOfReflection() {


    }

    _meetPrerequisite() {


    } 
}