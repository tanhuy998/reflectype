const { property_metadata_t } = require('../../reflection/metadata.js');
const ReflectionQuerySubject = require('../query/reflectionQuerySubject.js');
const ReflectionPropertyAbstract = require('../abstract/reflectionPropertyAbstract.js');
const { resolvePropertyMetadata } = require('../trait/traitPropertyReflection.js');

/**
 *  ReflectionPrototypeProperty focus on reading metadata of the prototype.
 *  because the fact that, with ReflectionProperty, we cannot reach the class's prototype's
 *  metadata without instantiating an object of a specific class.
 *  ReflectionPrototypeProperty instantiating object is not neccessary, just directly apply reflection
 *  on class to get info about the class's prototype.
 */
module.exports = class ReflectionPrototypeProperty extends ReflectionPropertyAbstract {

    #type;

    /**@type {boolean} */
    #isValid = false;

    /**@type {boolean} */
    #isPrivate;

    #defaultValue;

    #isMethod;

    #isStatic;

    #target;

    get target() {

        return this.#isValid ? this.#target : undefined;
    }

    get isStatic() {

        return this.#isStatic;
    }

    get isMethod() {

        return this.#isMethod;
    }

    get isPrivate() {

        return this.#isPrivate;
    }

    get type() {

        return this.#type;
    }

    get isValid() {

        return this.#isValid;
    }

    get defaultValue() {

        return this.isValid ? this.#defaultValue : undefined;
    }

    get value() {

        return this.#defaultValue;
    }

    /**
     * 
     * @param {any} _target 
     * @param {string || Symbol} _attributekey 
     */
    constructor(_target, _attributeKey) {

        super(_target, _attributeKey);   

        this.#init();
        this.reflector._dispose();
    }

    #init() {
        
        if (!super.isValidReflection) {
            
            this.#isValid = false;
            return;
        }

        const targetPropMeta = super.mirror()
                                .select(this.name)
                                .from(ReflectionQuerySubject.PROTOTYPE)
                                .retrieve()
                                ?? resolvePropertyMetadata.call(this, this.name);
        
        if (targetPropMeta instanceof property_metadata_t) {

            this.#type = targetPropMeta.type;
            this.#isPrivate = targetPropMeta.type || false;
            this.#isValid = true;
            this.#defaultValue = targetPropMeta.value;
            this.#isStatic = targetPropMeta.static;

            //const theProp = this.originClass.prototype[this.name];
            this.#isMethod = targetPropMeta.isMethod //&& typeof theProp === 'function';

            return;
        }        

        this.#isValid = false;
    }
}