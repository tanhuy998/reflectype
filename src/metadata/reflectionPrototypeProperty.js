const PrototypeReflector = require('./prototypeReflector');
const reflectionContext = require('./reflectorContext');

class ReflectionPrototypeProperty extends PrototypeReflector {

    #name;

    #type;

    /**@type {boolean} */
    #isValid = false;

    /**@type {boolean} */
    #isPrivate;

    #defaultValue;

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

    get isInstance() {

        return super.reflectionContext === reflectionContext.INSTANCE;
    }

    get defaultValue() {

        return this.isValid ? this.#defaultValue : undefined;
    }

    get value() {

        const key = this.#name;

        return this.isValid ? 
                (this.isInstance ? this.target[key] : this.originClass.prototype[key])
                : undefined;
    }

    /**
     * 
     * @param {any} _target 
     * @param {string || Symbol} _attributekey 
     */
    constructor(_target, _attributeKey) {

        if (!_attributekey || typeof _attributekey !== 'string' || typeof _attributekey !== 'symbol') {

            throw new TypeError('invalid type of _attribute parameter');
        }

        super(_target);   

        this.#name = _attributeKey;

        this.#init();

        super._dispose();
    }

    #init() {

        if (!this.isValidReflection) {

            return;
        }

        const targetAttrMeta = this.metadata.properties[this.#name];

        if (typeof targetAttrMeta !== 'object') {

            return;
        }

        this.#resolveMetadataResolution();

        this.#defaultValue = targetAttrMeta.value;
        this.#type = targetAttrMeta.type;
        this.#isPrivate = targetAttrMeta.type || false;
    }

    #resolveMetadataResolution() {


    }
}

module.exports = ReflectionPrototypeProperty;