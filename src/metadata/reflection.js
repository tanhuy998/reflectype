const ReflectionAspect = require("./aspect/reflectionAspect");
const Reflector = require("./reflector");

/**
 *  Reflection is the combination of Relector and ReflectionAspect.
 *  Classes which inherit Reflection class is considered as an aspect of reflection.
 */
module.exports = class Reflection {

    /**@type {Reflector} */
    #reflector;
    /**@type {ReflectionAspect} */
    #reflectionAspect;

    /**@type {Function|Object} */
    #target;

    /**@type {Reflector} */
    get reflector() {

        return this.#reflector;
    }

    get target() {
        
        this.#target;
    }

    get reflectionContext() {

        return this.#reflector.reflectionContext;
    }

    get target() {

        return this.#reflector.target;
    }

    get originClass() {

        return this.#reflector.originClass;
    }

    get isValidReflection() {

        return this.#reflector.isValidReflection
    }

    get isDisposed() {

        return this.#reflector.isDisposed;
    }


    constructor(_target) {

        this.#target = _target;

        this.#init();
    }

    #init() {

        this.#reflector = new Reflector(this.#target);

        if (!this.#reflector.isValidReflection) {

            return;
        }

        this.#reflectionAspect = new ReflectionAspect(this.#reflector);
    }

    mirror() {

        return this.#reflectionAspect.query();
    }
}