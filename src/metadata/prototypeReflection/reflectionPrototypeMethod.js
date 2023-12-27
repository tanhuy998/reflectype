const ReflectionPrototypeProperty = require("./reflectionPrototypeProperty.js");
const {reflectParameters} = require('../trait/traitfunctionReflection.js');
const { metaOf } = require("../../reflection/metadata.js");
const ReflectionPrototypeMethodParameter = require("../parameter/reflectionPrototypeMethodParameter.js");

/**
 * @typedef {import('../../../src/reflection/metadata.js').property_metadata_t} property_metadata_t
 */

class ReflectionPrototypeMethod extends ReflectionPrototypeProperty {

    #isValid = false;

    #returnType;
    #defaultArgs;
    #argsType;

    #target;
    #isMethod;

    get isMethod() {

        return this.#isMethod;
    }

    get isValid() {

        return this.#isValid;
    }
 
    get returnType() {

        return this.#returnType || super.type;
    }

    get defaultArguments() {

        return this.#defaultArgs;
    }

    get parameters() {

        return reflectParameters.call(this, ReflectionPrototypeMethodParameter);
    }

    get methodName() {

        return super.name;
    }

    constructor(_target, _methodKey) {

        super(...arguments);

        this.#init();
    }

    #init() {

        if (!super.isMethod) {

            return;
        }

        this.#isValid = true;
    }

    /**
     * @override
     * @returns {boolean}
     */
    _resolveAspectOfReflection() {

        const proto_propMeta = super._resolveAspectOfReflection();

        return proto_propMeta?.isMethod ? proto_propMeta : this.resolveAspectOnActualMethod();
    }

    /**
     * 
     * @returns {property_metadata_t?}
     */
    resolveAspectOnActualMethod() {
        
        const methodName = this.name;
        const actualMethod = this.originClass.prototype[methodName];

        if (typeof actualMethod === 'function') {

            return undefined;
        }

        const propMeta = metaOf(actualMethod);

        return propMeta?.isMethod ? propMeta : undefined;
    }

    invoke(...args) {

        if (!this.isValid) {

            throw new Error('cannot invoke method of an invalid Reflection');
        }

        const method = this.originClass.prototype[this.name];
        const _thisContext = this.isInstance ? this.target : this.originClass;

        method.call(_thisContext, ...args);   
    }
}

module.exports = ReflectionPrototypeMethod;