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

    get meetPrerequisite() {

        return this.#meetPrerequisite;
    }

    constructor(target, ...options) {

        super(target, ...options);

        preventNonInheritanceTakeEffect.call(this, AbstractReflection);
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

        if (super.isReflectionAspectCached) {
            
            this.#retrieveMetadataFromCache();
            return;
        }

        this.#queryAndHandleMetadata();
    }

    #retrieveMetadataFromCache() {

        this.#metadata = super.cache;
        this.#isValid = this._validateMetadata();
    }

    #queryAndHandleMetadata() {

        this.#metadata = this._resolveAspectOfReflection();
        
        if (!isObject(this.#metadata)) {

            this.#isValid = false;
            return;
        }
 
        this.#metadata = this._transformMetadata();
        this.#isValid = this._validateMetadata();

        if (!this.#isValid) {

            this.#metadata = undefined;
        }

        this.#manageCache();
    }

    #manageCache() {

        super._cache(this.#metadata);
    }

    _cache() {


    }

    __dispose() {

        this.#metadata = undefined;
        this.reflector._dispose();
    }

    _transformMetadata() {

        return this.#metadata
    }

    _validateMetadata() {

        return isObject(this.#metadata);
    }

    _resolveAspectOfReflection() {


    }

    _meetPrerequisite() {

        return this.isValidReflection === true;
    } 
}