const { isInstantiable, isObject, isFuntion } = require('../libs/type.js');
const { property_metadata_t, metaOf } = require('../reflection/metadata');
const isAbStract = require('../utils/isAbstract');
const self = require('../utils/self.js');
const PrototypeReflector = require('./prototypeReflection.js');
const ReflectionQuerySubject = require('./query/reflectionQuerySubject.js');
const Reflection = require('./refelction.js');
const reflectionContext = require('./reflectorContext');
const {resolvePropertyMetadata, checkPropertyDescriptorState, getMetadataFromProp} = require('./traitPropertyReflection.js');

/**
 *  ReflectionPrototypeProperty focus on reading metadata of the prototype.
 *  because the fact that, with ReflectionProperty, we cannot reach the class's prototype's
 *  metadata without instantiating an object of a specific class.
 *  ReflectionPrototypeProperty instantiating object is not neccessary, just directly apply reflection
 *  on class to get info about the class's prototype.
 */
class ReflectionPrototypeProperty extends Reflection {

    #name;

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

    get name() {

        return this.#name;
    }

    get isValid() {

        return this.#isValid;
    }

    get type() {

        return this.#type;
    }

    // get isInstance() {

    //     return super.reflectionContext === reflectionContext.INSTANCE;
    // }

    // get defaultValue() {

    //     return this.isValid ? this.#defaultValue : undefined;
    // }

    //
    get value() {

        return this.#defaultValue;
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

    /**
     * 
     * @param {any} _target 
     * @param {string || Symbol} _attributekey 
     */
    constructor(_target, _attributeKey) {

        if (!isAbStract(_target)) {

            throw new TypeError('ReflectionPrototypeProperty just affect on class, invalid type of _target param');
        }

        if (!_attributeKey || typeof _attributeKey !== 'string' && typeof _attributeKey !== 'symbol') {

            throw new TypeError('invalid type of _attribute parameter');
        }

        super(_target);   

        this.#name = _attributeKey;

        this.#init();

        super._dispose();
    }

    #init() {

        //const targetPropMeta = resolvePropertyMetadata.call(this, this.#name);
        //this.#defaultValue = this.originClass?.prototype?.properties[this.#name].value;

        if (!super.isValidReflection) {

            this.#isValid = false;
            return;
        }

        const targetPropMeta = super.mirror()
                                .select(this.#name)
                                .from(ReflectionQuerySubject.PROTOTYPE) 
                                ?? resolvePropertyMetadata.call(this, this.#name);

        
        if (targetPropMeta instanceof property_metadata_t) {

            const theProp = this.originClass.prototype[this.#name];

            this.#type = targetPropMeta.type;
            this.#isPrivate = targetPropMeta.type || false;
            this.#isValid = true;
            this.#defaultValue = targetPropMeta.value;
            this.#isStatic = targetPropMeta.static;

            this.#isMethod = typeof theProp === 'function' && targetPropMeta.isMethod;

            return;
        }        

        this.#isValid = false;
    }
}

module.exports = ReflectionPrototypeProperty;