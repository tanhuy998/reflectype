const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass.js");
const AccessorDecoratorError = require("../../libs/error/accessorDecorator/accessorDecoratorError.js");
const { getDecoratedValue } = require("../../libs/propertyDecorator.js");
const { isObjectKey } = require("../../libs/type.js");
const { property_metadata_t } = require("../../reflection/metadata.js");
const Reflection = require("../reflection.js");
const ReflectorContext = require("../reflectorContext.js");
const {resolvePropertyMetadata, checkPropertyDescriptorState} = require('../trait/traitPropertyReflection.js');
const AbstractReflection = require("./abstractReflection.js");

const PROPERTY_NAME = 0;

module.exports = class ReflectionPropertyAbstract extends AbstractReflection {

    #type;

    /**@type {boolean} */
    #isPrivate;
    #defaultValue;
    #isMethod;
    #isStatic;
    #allowNull;

    #decoratedValue;

    get name() {

        return this.options[PROPERTY_NAME];
    }

    get isWritable() {

        return checkPropertyDescriptorState.call(this, 'writable');
    }

    get isEnumerable() {

        return checkPropertyDescriptorState.call(this, 'enumerable');
    }

    get isConfigurable() {

        return checkPropertyDescriptorState.call(this, 'configurable')
    }

    get isStatic() {

        return this.#isStatic;
    }

    get isMethod() {

        return this.#isMethod;
    }

    get isPrivate() {

        return this.#isPrivate;
    }

    get type() {

        return this.#type;
    }

    get defaultValue() {

        return this.isValid ? this.#defaultValue : undefined;
    }

    get value() {

        if (!this.isValid) {
            
            return undefined;
        }

        if (this.isMethod) {

            return this.#decoratedValue;
        }

        try {

            if (super.reflectionContext !== ReflectorContext.INSTANCE) {
            
                return this.#defaultValue;
            }

            return this.#propMetaGetter.call(this.target) || this.#defaultValue;
        }
        catch (e) {
            
            return this.#defaultValue;
        }
    }

    get allowNull() {

        return this.#allowNull;
    }

    get #accessor() {

        return !this.#isMethod ? this.#decoratedValue : undefined;
    }

    get #propMetaGetter() {

        return this.#accessor?.get;
    }

    get #propMetaSetter() {

        return this.#accessor?.set;
    }

    constructor(target, propName) {

        if (!isObjectKey(propName)) {

            throw new TypeError('invalid type of propName parameter');
        }

        super(target, propName);

        preventNonInheritanceTakeEffect.call(this, ReflectionPropertyAbstract);

        this.#init();
    }

    _meetPrerequisite() {

        return super.isValidReflection && super.reflectionContext !== ReflectorContext.OTHER;
    }

    #init() {

        if (!super.isValid) {

            return;
        }

        const targetPropMeta = this.metadata;

        if (targetPropMeta instanceof property_metadata_t) {

            this.#type = targetPropMeta.type;
            this.#isPrivate = targetPropMeta.type || false;

            this.#defaultValue = targetPropMeta.value;
            this.#isStatic = targetPropMeta.static;
            this.#allowNull = targetPropMeta.allowNull;
            //const theProp = this.originClass.prototype[this.name];
            this.#isMethod = targetPropMeta.isMethod //&& typeof theProp === 'function';

            this.#decoratedValue = !this.#isMethod ? getDecoratedValue(targetPropMeta) : undefined;

            return;
        }
    }

    /**
     * 
     * @param {any} _value 
     * @returns {boolean}
     * 
     * @throws
     */
    setValue(_value) {

        if (this.isMethod) {

            throw new Error('the target of property reflection is a method, value could not be setted');
        }

        if (
            !this.isValid ||
            super.reflectionContext !== ReflectorContext.INSTANCE
        ) {

            return false;
        }

        try {

            /**
             * old version of decorator proposal
             * set.call(this.target, _value);
             */
            this.#propMetaSetter.call(this.target, _value);

            return true;
        }
        catch (e) {
            
            if (e instanceof AccessorDecoratorError) {

                throw e;
            }

            return false;
        }
    }
}