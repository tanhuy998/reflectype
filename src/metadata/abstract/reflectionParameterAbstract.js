const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { getMetadataFootPrintByKey } = require("../../libs/footPrint");
const { isFunctionParamIdentifier, isValuable } = require("../../libs/type");
const { property_metadata_t } = require("../../reflection/metadata");
const AbstractReflection = require("./abstractReflection");
const { ORIGIN_FUNCTION } = require("./constant");

const METHOD_NAME = 0;
const PARAM_INDENTIFIER = 1;

module.exports = class ReflectionParameterAbstract extends AbstractReflection {

    #index;
    #type;
    #value;

    #isValid;
    #name

    get isValid() {

        return this.#isValid;
    }

    get paramName() {

        return this.#name ?? this.options[PARAM_INDENTIFIER];
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

    constructor(_target, paramIndex, methodName) {

        if (!isFunctionParamIdentifier(paramIndex)) {
            
            if (
                typeof paramIndex === 'number' &&
                paramIndex < 0
            ) {

                throw new TypeError('parameter _index must be a number indicating the order of the function\'s param');
            }

            super(_target, methodName);
        }
        else {

            super(_target, methodName, paramIndex);
        }
        
        preventNonInheritanceTakeEffect.call(this, ReflectionParameterAbstract);

        this.#index = typeof paramIndex === 'number' ? paramIndex : undefined;
        this.#init();
    }

    
    _meetPrerequisite() {

        // const funcMeta = this._resovleFunctionMetadata();
        // return funcMeta instanceof property_metadata_t;

        //const _class = this.reflectionContext !== ReflectorContext.OTHER ? 
    }

    _resolveAspectOfReflection() {

        return this._resovleFunctionMetadata();
    }

    /**
     * For parameter discovery progress
     */
    _getActualFunction() {
        
        return getMetadataFootPrintByKey(this.metadata, ORIGIN_FUNCTION);
    }

    #init() {

        if (!super.isValid) {

            return;
        }

        this.#verifyParam();
        this.#verifyMethod();   
    }

    /**
     * 
     * @returns {boolean}
     */
    #verifyMethod() {
        
        if (!this.isValid) {

            return;
        }

        /**@type {property_metadata_t} */
        const funcMeta = super.metadata;
        const paramIndex = this.#index;
        //const paramIndex = this.metadata.paramsName.indexOf()
        const {defaultParamsType} = funcMeta;
        const defaultValues = funcMeta.value;
        
        this.#type = Array.isArray(defaultParamsType) ? defaultParamsType[paramIndex] : undefined;
        this.#value = Array.isArray(defaultValues) ? defaultValues[paramIndex] : undefined;
    }

    #verifyParam() {

        if (this.metadata.paramsName.length === 0) {

            return;
        }

        this.#resolveParamName();
        this.#readOnIdentifier();
    }

    #resolveParamName() {

        const paramIndex = this.#index;


        if (typeof paramIndex !== 'number') {
            /**
             *  paramIndex and param name is validated by constructor,
             *  if paramIndex is undefined, it means param name exists
             */
            return;
        }
        
        this.#name = this.metadata.paramsName[paramIndex] || undefined;
    }

    #readOnIdentifier() {

        const name = this.paramName;

        if (!isFunctionParamIdentifier(name)) {

            return;
        }

        if (
            !isValuable(this.#index)
        ) {

            this.#index = this.metadata.paramsName.indexOf(name);
        }

        this.#isValid = true;
    }


    _resovleFunctionMetadata() {
        /**
         * for derived class overriden
         */
    }
}