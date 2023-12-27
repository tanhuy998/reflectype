const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass.js");
const { isObjectKey } = require("../../libs/type.js");
const { property_metadata_t } = require("../../reflection/metadata.js");
const Reflection = require("../reflection.js");
const ReflectorContext = require("../reflectorContext.js");
const {resolvePropertyMetadata, checkPropertyDescriptorState} = require('../trait/traitPropertyReflection.js');
const AbstractReflection = require("./abstractReflection.js");

const PROPERTY_NAME = 0;

module.exports = class ReflectionPropertyAbstract extends AbstractReflection {

    #name;

    #type;

    // /**@type {boolean} */
    // #isValid = false;

    /**@type {boolean} */
    #isPrivate;

    #defaultValue;

    #isMethod;

    #isStatic;

    #target;

    #allowNull;

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

    get target() {

        return this.isValid ? this.#target : undefined;
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

    get isValid() {

        return this.isValid;
    }

    get defaultValue() {

        return this.isValid ? this.#defaultValue : undefined;
    }

    get value() {

        return this.#defaultValue;
    }

    get allowNull() {

        return this.#allowNull;
    }

    constructor(target, propName) {

        if (!isObjectKey(propName)) {

            throw new TypeError('invalid type of propName parameter');
        }

        super(target, propName);

        preventNonInheritanceTakeEffect.call(this, ReflectionPropertyAbstract);
        //this.#name = propName;

        this.#init();
    }

    _meetPrerequisite() {

        return super.isValidReflection && super.reflectionContext !== ReflectorContext.OTHER;
    }

    // #init() {

    //     if (!this.isValid) {

    //         return;
    //     }
        
    //     const propMeta = this.metadata;


    // }

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

            return;
        }
    }
}