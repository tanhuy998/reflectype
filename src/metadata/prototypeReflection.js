const { prototype } = require("events");
const Reflector = require("./reflector");
const ReflectorContext = require("./reflectorContext");
const Reflection = require("./refelction");
const ReflectionQuerySubject = require("./query/reflectionQuerySubject");
const ReflectionPrototypeProperty = require("./reflectionPrototypeProperty");
//const { prototype_metadata_t } = require("../reflection/metadata");

/**
 * @typedef {import("../reflection/metadata").prototype_metadata_t} prototype_metadata_t 
 */

/**
 *  PrototypeReflector focus on the prototype metadata of class/object
 */
module.exports = class PrototypeReflector extends Reflection {

    /**@type {prototype_metadata_t} */
    #metadata;

    #isDisposed;

    #isValid;

    #es6 = false;

    get isValidReflection() {

        return this.#isValid;
    }

    get properties() {

        if (!this.#isValid) {

            return undefined;
        }

        let ret;

        for (const propName in this.#metadata.properties) {

            const reflectionProp = new ReflectionPrototypeProperty(this.target, propName);

            if (!reflectionProp.isValidReflection) {

                continue;
            }
            
            (ret ?? []).push(reflectionProp);
        }

        return ret;
    }

    get methods() {

        
    }

    get field() {


    }

    get isES6Class() {

        return this.#es6;
    }

    constructor(target) {

        super(target);

        this.#init();
    }

    #init() {

        const protoMeta = super.mirror().from(ReflectionQuerySubject.PROTOTYPE);

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
        this.#isDisposed = false;
    }

    _dispose() {

        this.#metadata = undefined;
        this.#isDisposed = true;
    }
}