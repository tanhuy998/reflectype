const Reflector = require('./reflector.js');
const ReflectorContext = require('./reflectorContext.js');
const isAbastract = require('../utils/isAbstract.js');
const { metadata_t, metaOf, property_metadata_t } = require('../reflection/metadata.js');
const {resolvePropertyMetadata, checkPropertyDescriptorState} = require('./traitPropertyReflection.js')

/**
 *  RefletionPropety reads metadata of class/object,
 *  the reflection result is based on the target of reflection (class/object)
 *  so it is for general use only.
 */
class ReflectionProperty extends Reflector{

    #kind;

    /**
     * if the property is kind of field, type is the datatype of the field.
     * if the property is a method, type is the return type of the method.
     * 
     * @type {any} 
     */
    #type;

    /** @type {boolean} */
    #isMethod;

    #value;

    /**@type {boolean} */
    #isStatic;

    /** @type {boolean} */
    #isPrivate;

    /**@type {boolean} */
    #isValid;

    // #originClass;

    // #target;

    #name;

    // get target() {

    //     return this.#target;
    // }

    // get originClass() {

    //     return this.#originClass;
    // }
    get name() {

        return this.#name;
    }

    get value() {

        return this.#isValid ? this.#value : undefined;
    }

    get type() {

        return this.isValid ? this.#type : undefined;
    }

    get kind() {

        return this.#isValid ? this.#kind : undefined;
    }

    get isPrivate() {

        return this.isValid ? this.#isPrivate : undefined;
    }

    get isStatic() {

        return this.isValid ? this.#isStatic : undefined;
    }

    get isValid() {

        return this.#isValid;
    }

    get isMethod() {

        return this.#isValid ? this.#isMethod : undefined;
    }

    get defaultValue() {

        if (this.isValid) {

            return;
        }

        const meta = metaOf(this.originClass);

        return this.reflectionContext === ReflectorContext.ABSTRACT ? 
                meta.properties[this.#name].value :
                meta.prototype?.properties[this.#name].value;
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
     * @param {Function} target 
     * @param {string || Symbol} property 
     */
    constructor(target, property) {

        if (!target && !property) {

            throw new Error('')
        }

        super(target);

        //this.#target = target;

        this.#name = property;

        this.#init(property);

        this._dispose();
    }

    /**
     * 
     * @param {keyof ReflectorContext} target 
     * @param {*} property 
     * @returns 
     */
    #init(prop) {

        const propMeta = resolvePropertyMetadata.call(this, prop);
        
        if (propMeta instanceof property_metadata_t) {

            this.#isStatic = propMeta.static || false;
            this.#isPrivate = propMeta.private || true;
            this.#type = propMeta.type;
            this.#value = propMeta.value;
    
            const { value } = propMeta;
    
            this.#isMethod = (typeof value === 'function' && !value.prototype);
    
            this.#isValid = true;
    
            return;
        }
    
        this.#isValid = false;
        
        return;
    }

    #checkMatchType(_value, _type) {

        if (_value instanceof _type) {

            return true;
        }

        throw new TypeError('the value setted is not match the type')
    }

    #matchType(_value) {

        return this.#checkMatchType(_value, this.type);
    }

    setValue(value) {

        if (this.#matchType(value)) {

            this.#value = value;
        }
    }
}

module.exports = ReflectionProperty;