const { isFuntion } = require('../../libs/type.js');
//const { property_metadata_t, metaOf } = require('../../reflection/metadata.js');
const ReflectionParameterAbstract = require('../abstract/reflectionParameterAbstract.js');
const ReflectorContext = require('../reflectorContext.js');


const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { getMetadataFootPrintByKey } = require("../../libs/footPrint");
const { isFunctionParamIdentifier } = require("../../libs/type");
const { property_metadata_t, parameter_metadata_t, metaOf } = require("../../reflection/metadata");
const AbstractReflection = require("../abstract/abstractReflection");
//const { ORIGIN_FUNCTION } = require("./constant");

/**
 * @typedef {import('../function/reflectionFunction.js')} ReflectionFunction
 */


const PARAM_KEY = 0;

module.exports = class ReflectionFunctionParameter extends AbstractReflection {

    #index;
    #type;
    #value;
    #isDeclared;
    #name
    #isVarArgs;
    #allowNull;

    get allowNull() {

        return this.isValid ? this.#allowNull : undefined;
    }

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

    get paramIndex() {

        return this.#index;
    }

    /**@type {property_metadata_t} */
    get metadata() {

        return super.metadata;
    }

    get isDeclared() {

        return this.#isDeclared;
    }

    get isVarArgs() {

        return this.#isVarArgs;
    }

    constructor(_func, _index) {

        if (!isFunctionParamIdentifier(_index)) {
            
            if (
                typeof _index === 'number' &&
                _index < 0
            ) {

                throw new TypeError('parameter _index must be a number indicating the order of the function\'s param');
            }
        }

        super(...arguments);

        this.#index = typeof paramIndex === 'number' ? paramIndex : undefined;
        this.#init();
    }

    _meetPrerequisite() {

        return super.reflectionContext === ReflectorContext.OTHER &&
                    isFuntion(super.target)
    }


    _resolveAspectOfReflection() {

        if (
            !this.meetPrerequisite
        ) {

            return undefined;
        }

        return metaOf(super.target);
    }

    _transformMetadata() {
        
        if (!super.isValidReflection) {

            return undefined;
        }
        
        const propMeta = this.metadata;
        
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

        const paramName = (
            typeof index_or_name === 'number' &&
            // safe index shifting
            index_or_name + 1 <= funcMeta.paramsName?.length + 2
        ) ?  funcMeta.paramsName[index_or_name] 
        : typeof index_or_name === 'string' ? index_or_name : undefined;
    
        return funcMeta.parameters?.[paramName];
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
        this.#allowNull = paramMeta.allowNull;
        this.#name = paramMeta.paramName;
    }
}