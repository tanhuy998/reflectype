const ReflectorContext = require("../reflectorContext.js");
const { property_metadata_t, metaOf } = require("../../reflection/metadata.js");
const {reflectParameters} = require('../trait/traitfunctionReflection.js');
const AbstractReflection = require("../abstract/abstractReflection.js");


/**
 * @typedef {import('../abstract/reflectionParameterAbstract.js')} ReflectionParameterAbstract
 * @typedef {import('../../../src/reflection/metadata.js').property_metadata_t} property_metadata_t
 */

class ReflectionFunction extends AbstractReflection {


    #isValid = false;

    #returnType;
    #defaultArgs;
    #argsType;

    #methodName;

    get isValid() {

        return this.#isValid;
    }
 
    get returnType() {

        return this.#returnType || super.type;
    }

    get defaultArguments() {

        return this.#defaultArgs;
    }

    /**@type {Array<ReflectionPrototypeMethodParameter>} */
    get parameters() {

        const ReflectionParameterClass = this._getReflectionParameterClass();

        return reflectParameters.call(this, ReflectionParameterClass);
    }

    get methodName() {

        return this.#methodName;
    }

    constructor(_target) {

        super(...arguments);
        
        this.#init();   
    }

    #init() {

        if (
            !super.isValid ||
            !super.metadata.isMethod
        ) {
            
            this.#isValid = false;
            return;
        }

        this.#isValid = true;

        const funcMeta = this.metadata;

        this.#defaultArgs = funcMeta.value;
        this.#returnType = funcMeta.type;
        this.#methodName = funcMeta.name;
    }

    _meetPrerequisite() {

        return super.isValidReflection && 
                super.reflectionContext === ReflectorContext.OTHER;
    }

    /**
     * @override
     * @returns {boolean}
     */
    _resolveAspectOfReflection() {

        return this.resolveAspectOnActualMethod();
    }

    /**
     * 
     * @returns {property_metadata_t?}
     */
    resolveAspectOnActualMethod() {

        if (
            super.meetPrerequisite &&
            super.reflectionContext === ReflectionFunction.OTHER
        ) {
            /**
             * especially, this method just proceed unless reflection context is OTHER
             */
            return undefined;
        }

        //const methodName = this.name;
        //const actualMethod = this.originClass.prototype[methodName];
        const actualMethod = this.target;

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

    /**
     *  
     *  @returns {typeof ReflectionParameterAbstract} 
     */
    _getReflectionParameterClass() {

        return require('../parameter/reflectionFunctionParameter.js');
    }
}

module.exports = ReflectionFunction;