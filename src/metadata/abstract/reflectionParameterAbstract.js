const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { property_metadata_t } = require("../../reflection/metadata");
const AbstractReflection = require("./abstractReflection");

module.exports = class ReflectionParameterAbstract extends AbstractReflection {

    #index;

    #type;

    #value

    get paramIndex() {

        return this.#index;
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

        return this.options[0];
    }

    get paramIndex() {

        return this.#index;
    }

    constructor(_target, paramIndex, methodName) {

        if (paramIndex < 0) {

            throw new TypeError('parameter _index must be a number indicating the order of the function\'s param');
        }

        super(_target, methodName);
        
        preventNonInheritanceTakeEffect.call(this, ReflectionParameterAbstract);

        this.#index = paramIndex;

        this.#init();
    }

    
    _meetPrerequisite() {

        const funcMeta = this._resovleFunctionMetadata();

        return funcMeta instanceof property_metadata_t;
    }

    _resolveAspectOfReflection() {

        return this._resovleFunctionMetadata();
    }

    #init() {

        if (!super.isValid) {

            return;
        }

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
        const {defaultParamsType} = funcMeta;
        const defaultValues = funcMeta.value;
        
        this.#type = Array.isArray(defaultParamsType) ? defaultParamsType[paramIndex] : undefined;
        this.#value = Array.isArray(defaultValues) ? defaultValues[paramIndex] : undefined;
    }


    _resovleFunctionMetadata() {
        /**
         * for derived class overriden
         */
    }
}