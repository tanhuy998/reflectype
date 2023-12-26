const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { property_metadata_t } = require("../../reflection/metadata");
const Reflection = require("../reflection");
const ReflectorContext = require("../reflectorContext");

module.exports = class ReflectionParameterAbstract extends Reflection {

    #index;

    #isValid;

    #type;

    #value

    #name;

    get isValid() {

        return this.#isValid;
    }

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

        return this.#isValid ? Boolean(this.#type) : false;
    }

    get hasDefaultValue() {

        return this.#isValid ? Boolean(this.#value) : false;
    }

    get methodName() {

        return this.#name;
    }

    constructor(_target, paramIndex, methodName) {

        if (paramIndex < 0) {

            throw new TypeError('parameter _index must be a number indicating the order of the function\'s param');
        }

        super(_target);
        
        preventNonInheritanceTakeEffect.call(this, ReflectionParameterAbstract);

        this.#name = methodName;
        this.#index = paramIndex;

        this.#init();
    }

    #init() {

        if (!super.isValidReflection) {

            this.#isValid = false;
            return;
        }

        this.#verifyMethod();   
    }

    #verifyMethod() {

        const funcMeta = this._resovleFunctionMetadata();

        if (!(funcMeta instanceof property_metadata_t)) {

            this.#isValid = false;
            return;
        }
        
        const paramIndex = this.#index;
        const {defaultParamsType} = funcMeta;

        this.#isValid = true;
        this.#type = Array.isArray(defaultParamsType) ? defaultParamsType[paramIndex] : undefined;
    }


    _resovleFunctionMetadata() {
        /**
         * for derived class overriden
         */
    }
}