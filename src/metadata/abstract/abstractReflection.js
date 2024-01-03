const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { isObject } = require("../../libs/type");
const Reflection = require("../reflection");

/**
 * @typedef {import('../../../src/reflection/metadata.js').property_metadata_t} property_metadata_t
 * @typedef {import('../../../src/reflection/metadata.js').metadata_t} metadata_t
 */

/**
 * AbstractReflection defines an interface for higher level of reflection.
 * By deault, It requires derived classes to ovveride two method _meetPrerequisite() and _resolveAspectOfReflection().
 * _meetPrerequisite() is called for checking entrance conditions of Reflector. When met Prerequisites, 
 * _resolveAspectOfReflection() is called for retrieving the target piece(s) of metadata (considered as aspect of reflection).
 * If no value returned from _resolveAspectOfReflection(), isValid flag will be set to false. Otherwise, the rest of metadata validation
 * would be devolved to derived class.
 */
module.exports = class AbstractReflection extends Reflection {

    #options;

    /**@type {metadata_t|property_metadata_t} */
    #metadata;

    #isValid;

    #meetPrerequisite;

    get metadata() {

        return this.#metadata;
    }

    get isValid() {

        return this.#isValid;
    }

    get options() {

        return this.#options;
    }

    get meetPrerequisite() {

        return this.#meetPrerequisite;
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

            this.#meetPrerequisite = false;
            return;
        }

        this.#meetPrerequisite = true;
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