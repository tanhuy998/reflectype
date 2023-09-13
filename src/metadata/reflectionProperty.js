const Reflector = require('./reflector.js');
const ReflectorContext = require('./reflectorContext.js');

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

    /**
     * @param {Object} target 
     * @param {string} property 
     */
    constructor(target, property) {

        if (!target || !property) {

            throw new Error('')
        }

        super(target);

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

        if (!super.isValidReflection) {

            this.#isValid = false;

            return;
        }  

        const isAbstract = (super.reflectionContext === ReflectorContext.ABSTRACT);

        const contextMetadata = (isAbstract) ? super.metadata : super.metadata?.prototype;

        if (typeof contextMetadata !== 'object') {

            this.#isValid = false;

            return;
        }

        const {properties} = contextMetadata;

        const propMeta = properties[prop];

        if (typeof propMeta !== 'object') {

            this.#isValid = false;

            return;
        }

        this.#isStatic = propMeta.static || false;
        this.#isPrivate = propMeta.private || true;
        this.#type = propMeta.type;
        this.#value = propMeta.value;

        const {value} = propMeta;

        this.#isMethod = (typeof value === 'function' && !value.prototype);

        this.#isValid = true;
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