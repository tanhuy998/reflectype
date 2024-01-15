const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { getMetadataFootPrintByKey } = require("../../libs/footPrint");
const { isFunctionParamIdentifier } = require("../../libs/type");
const { property_metadata_t } = require("../../reflection/metadata");
const AbstractReflection = require("./abstractReflection");
const { ORIGIN_FUNCTION } = require("./constant");

const METHOD_NAME = 1;
const PARAM_KEY = 0;

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

        const funcMeta = this.metadata.functionMeta;
        const paramIndex = this.#index;
        //const paramIndex = this.metadata.paramsName.indexOf()
        const {defaultParamsType} = funcMeta;
        const defaultValues = funcMeta.value;
        
        this.#type = Array.isArray(defaultParamsType) ? defaultParamsType[paramIndex] : undefined;
        this.#value = Array.isArray(defaultValues) ? defaultValues[paramIndex] : undefined;
    }

    #verifyParam() {

        this.#resolveIdentifier();
        this.#resolveParam();
        this.#prepare();

        if (!this.isValid) {

            this.#index = undefined;
        }
    }

    #resolveIdentifier() {

        const paramKey = this.#paramKey;
        const keyType = typeof paramKey;
        const funcMeta = this.metadata.functionMeta;

        if (keyType === 'string') {

            this.#index = funcMeta.paramsName.indexOf(paramKey);
        }
        else if (keyType === 'number') {

            this.#index = paramKey;
        }
    }

    #resolveParam() {

        const paramIndex = this.#index;
        const paramsTypesCount = this.metadata.functionMeta.defaultParamsType.length;

        if (
            typeof paramIndex === 'number' &&
            paramIndex >= 0 && paramIndex < paramsTypesCount
        ) {

            this.#isValid = true;
        }
    }

    #prepare() {

        if (!this.#isValid) {

            return;
        }

        const declaredParamsName = this.metadata.functionMeta.paramsName;

        if (declaredParamsName.length === 0) {

            this.#name = undefined;
            return;
        }

        this.#name = typeof this.#paramKey === 'string' ? declaredParamsName[this.#index] : undefined;
    }

    _resovleFunctionMetadata() {
        /**
         * for derived class overriden
         */
    }
}