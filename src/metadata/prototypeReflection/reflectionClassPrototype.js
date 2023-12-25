const ReflectorContext = require("../reflectorContext");
const ReflectionQuerySubject = require("../query/reflectionQuerySubject");
const ReflectionPrototypeProperty = require("./reflectionPrototypeProperty");
const ReflectionPrototypeMethod = require("./reflectionPrototypeMethod");
const ReflectionPrototypeAttribute = require("./reflectionPrototypeAttribute");
const { isInstantiableOrFail } = require("../../libs/type");
const ReflectionClassAbstract = require("../abstract/reflectionClassAbstract");
const { prototype_metadata_t } = require("../../reflection/metadata");

/**
 * @typedef {import("../../reflection/metadata").prototype_metadata_t} prototype_metadata_t 
 */

/**
 *  PrototypeReflector focus on the prototype metadata of class/object
 */
module.exports = class ReflectionClassPrototype extends ReflectionClassAbstract {

    /**@type {prototype_metadata_t} */
    #metadata;

    #isValid;

    get isValidReflection() {

        return this.#isValid;
    }

    get isValid() {

        return this.#isValid;
    }

    get properties() {

        if (!this.#isValid) {

            return undefined;
        }

        return this.#_retrievePropertyReflections(ReflectionPrototypeProperty);
    }

    get methods() {

        if (!this.#isValid) {

            return undefined;
        }

        return this.#_retrievePropertyReflections(ReflectionPrototypeMethod);
    }

    get attributes() {

        if (!this.#isValid) {

            return undefined;
        }

        return this.#_retrievePropertyReflections(ReflectionPrototypeAttribute);
    }

    constructor(target) {

        super(target);

        this.#init();

        super.reflector._dispose();
    }

    #init() {

        const protoMeta = super.mirror()
                                .from(ReflectionQuerySubject.PROTOTYPE)
                                .retrieve();

        if (
            !super.isValidReflection || 
        super.reflectionContext === ReflectorContext.OTHER ||
            !(protoMeta instanceof prototype_metadata_t)
        ) {
            
            this.#isValid = false;

            return;
        }

        this.#isValid = true;
        this.#metadata = protoMeta;
    }

    /**
     * 
     * @param {typeof ReflectionPrototypeProperty} _reflectionClass 
     * 
     * @return {Iterable<ReflectionPrototypeProperty>?}
     */
    #_retrievePropertyReflections(_reflectionClass) {

        isInstantiableOrFail(_reflectionClass);

        let ret;

        for (const propName in this.#metadata.properties) {

            const reflectionProp = new _reflectionClass(this.originClass, propName);

            if (!reflectionProp.isValid) {

                continue;
            }

            (ret ??= []).push(reflectionProp);
        }

        return ret;
    }
}