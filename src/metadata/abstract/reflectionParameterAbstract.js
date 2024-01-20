const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { getMetadataFootPrintByKey } = require("../../libs/footPrint");
const { isFunctionParamIdentifier } = require("../../libs/type");
const { property_metadata_t, parameter_metadata_t } = require("../../reflection/metadata");
const AbstractReflection = require("./abstractReflection");
const { ORIGIN_FUNCTION } = require("./constant");

/**
 * @typedef {import('../function/reflectionFunction.js')} ReflectionFunction
 */

const METHOD_NAME = 1;
const PARAM_KEY = 0;

module.exports = class ReflectionParameterAbstract extends AbstractReflection {

    #index;
    #type;
    #value;

    #isDeclared;
    #isValid;
    #name
    #isVarArgs;

    // get isValid() {

    //     return this.#isValid;
    // }

    get paramName() {

        return this.#name;
    }


    get type() {

        return this.#type;
    }

    get defaultValue() {

        return this.#value;
    }

    get hasType() {

        return this.isValid ? Boolean(this.#type) : false;
    }

    get hasDefaultValue() {

        return this.isValid ? Boolean(this.#value) : false;
    }

    get methodName() {

        return this.options[METHOD_NAME];
    }

    get paramIndex() {

        return this.#index;
    }

    /**@type {property_metadata_t} */
    get metadata() {

        return super.metadata;
    }

    get #paramKey() {

        return this.options[PARAM_KEY];
    }

    get #methodName() {

        return this.options[METHOD_NAME];
    }

    get isDeclared() {

        return this.#isDeclared;
    }

    get isVarArgs() {

        return this.#isVarArgs;
    }

    /**@type {} */
    get owner() {

        return;
    }

    constructor(_target, paramIndex, methodName) {

        if (!isFunctionParamIdentifier(paramIndex)) {
            
            if (
                typeof paramIndex === 'number' &&
                paramIndex < 0
            ) {

                throw new TypeError('parameter _index must be a number indicating the order of the function\'s param');
            }
        }

        super(_target, paramIndex, methodName);
        
        preventNonInheritanceTakeEffect.call(this, ReflectionParameterAbstract);

        this.#index = typeof paramIndex === 'number' ? paramIndex : undefined;
        this.#init();
    }

    
    _meetPrerequisite() {

        return this.isValidReflection;
    }

    /**
     * @returns {property_metadata_t}
     */
    _resovleFunctionMetadata() {
        /**
         * for derived class overriden
         */
    }

    /**
     * @returns {ReflectionFunction}
     */
    _getOwnerReflectionMethod() {


    }

    _resolveAspectOfReflection() {

        if (!super.isValidReflection) {

            return undefined;
        }

        const propMeta = this._resovleFunctionMetadata();

        if (
            propMeta?.isMethod !== true &&
            !(propMeta instanceof property_metadata_t)
        ) {

            return undefined;
        }

        /**
         * There are two strategies, either input is number indicate the index of the parameter
         * or the method's declared parameter's name.
         */
        const index_or_name = this.options[PARAM_KEY];
        const funcMeta = propMeta.functionMeta;
        
        // if (
        //     typeof index_or_name === 'number' &&
        //     // safe index shifting
        //     index_or_name + 1 <= funcMeta.paramsName?.length + 2
        // ) {

        //     //this.#isDeclared = true;
        //     const paramName = funcMeta[index_or_name];

        //     return funcMeta.parameters?.[paramName];
        // }

        // const params = funcMeta.parameters;

        // if (
        //     typeof index_or_name === 'string'
        // ) {

        //     //this.#isDeclared = true;
        //     return funcMeta.parameters?.[index_or_name];
        // }

        const paramName = (
            typeof index_or_name === 'number' &&
            // safe index shifting
            index_or_name + 1 <= funcMeta.paramsName?.length + 2
        ) ?  funcMeta.paramsName[index_or_name] 
        : typeof index_or_name === 'string' ? index_or_name : undefined;
    
        return funcMeta.parameters?.[paramName];
    }

    /**
     * For parameter discovery progress
     */
    _getActualFunction() {
        
        return getMetadataFootPrintByKey(this.metadata, ORIGIN_FUNCTION);
    }

    #init() {

        this.#verifyMethod();   
    }

    /**
     * 
     * @returns {boolean}
     */
    #verifyMethod() {
        
        if (!super.isValid) {

            this.#isDeclared = false;
            return;
        }

        /**@type {parameter_metadata_t} */
        const paramMeta = this.metadata;
        // const paramName = paramMeta.paramName;
        // const funcMeta = paramMeta.owner;

        this.#isDeclared = true;

        this.#index = paramMeta.index;
        this.#isVarArgs = paramMeta.rest;
        this.#type = paramMeta.type;
        this.#value = paramMeta.defaultValue;
    }
}