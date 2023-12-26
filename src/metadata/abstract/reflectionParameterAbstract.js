const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { property_metadata_t } = require("../../reflection/metadata");
const Reflection = require("../reflection");
const ReflectorContext = require("../reflectorContext");
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

        const funcMeta = super.metadata;
        const paramIndex = this.#index;
        const {defaultParamsType} = funcMeta;

        this.#type = Array.isArray(defaultParamsType) ? defaultParamsType[paramIndex] : undefined;
    }


    _resovleFunctionMetadata() {
        /**
         * for derived class overriden
         */
    }
}