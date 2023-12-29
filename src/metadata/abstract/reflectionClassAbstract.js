const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { isInstantiable } = require("../../libs/type");
const ReflectorContext = require("../reflectorContext");
const AbstractReflection = require("./abstractReflection");

/**
 * @typedef {import('./reflectionPropertyAbstract')} ReflectionPropertyAbstract
 * @typedef {import('./reflectionMethodAbstract.js')} ReflectionMethodAbstract
 */

module.exports = class ReflectionClassAbstract extends AbstractReflection {

    #es6 = false;

    /**@type {boolean} */
    get isES6Class() {

        return this.#es6;
    }

    /**@type {Array<ReflectionPropertyAbstract>?} */
    get properties() {

        if (!this.isValid) {

            return undefined;
        }

        const _Class = this._getPropertyReflectionClass();

        return this.#_retrievePropertyReflections(_Class);
    }

    /**@type {Array<ReflectionMethodAbstract>?} */
    get methods() {

        if (!this.isValid) {

            return undefined;
        }

        const _Class = this._getMethodReflectionClass();

        return this.#_retrievePropertyReflections(_Class);
    }

    /**@type {Array<ReflectionPropertyAbstract>?} */
    get attributes() {

        if (!this.isValid) {

            return undefined;
        }

        const _Class = this._getAttributeReflectionClass();

        return this.#_retrievePropertyReflections(_Class);
    }

    constructor(_any) {

        super(_any);

        preventNonInheritanceTakeEffect.call(this, ReflectionClassAbstract);

        this.#init();
    }

    /**
     * @override
     * @returns {boolean}
     */
    _meetPrerequisite() {

        return super.isValidReflection && super.reflectionContext !== ReflectorContext.OTHER;
    }

    #init() {

        this.#checkES6();
    }

    #checkES6() {

        this.#es6 = this.originClass?.toString()
                    .match(/^class \w+ {/) ? true : false;
    }

    /**
     * 
     * @param {typeof ReflectionPrototypeProperty} _reflectionClass 
     * 
     * @return {Iterable<ReflectionPrototypeProperty>?}
     */
    #_retrievePropertyReflections(_reflectionClass) {

        if (!isInstantiable(_reflectionClass)) {

            return undefined;
        };

        let ret;

        for (const propName in this.metadata?.properties || {}) {

            const reflectionProp = new _reflectionClass(this.originClass, propName);

            if (!reflectionProp.isValid) {

                continue;
            }

            (ret ??= []).push(reflectionProp);
        }

        return ret;
    }

    _getPropertyReflectionClass() {


    }

    _getMethodReflectionClass() {


    }

    _getAttributeReflectionClass() {


    }
}