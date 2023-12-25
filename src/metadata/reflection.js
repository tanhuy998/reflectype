const ReflectionAspect = require("./aspect/reflectionAspect");
const Reflector = require("./reflector");

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

        const reflector = new Reflector(this.#target);

        if (!reflector.isValidReflection) {

            return;
        }

        this.#reflector = reflector;
        this.#reflectionAspect = new ReflectionAspect(reflector);
    }

    mirror() {

        return this.#reflectionAspect.query();
    }
}