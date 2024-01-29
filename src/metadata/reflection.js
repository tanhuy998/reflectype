const { isValuable } = require("../libs/type");
const self = require("../utils/self");
const ReflectionAspect = require("./aspect/reflectionAspect");
const { getCache, setCache, isValidCache, extract } = require("./cache");
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
    #cache;
    #options;
    #isCached = false;

    get options() {

        return this.#options;
    }

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

    get isReflectionAspectCached() {

        return this.#isCached;
    }

    get cache() {

        return this.#isCached ? extract(this.#cache) : undefined;
    }

    constructor(_target, ...options) {
        
        this.#target = _target;
        this.#options = options;
        this.#init();
    }

    #init() {

        this.#reflector = new Reflector(this.#target);

        if (!this.#reflector.isValidReflection) {

            return;
        }

        this.#reflectionAspect = new ReflectionAspect(this.#reflector);
        this.#retrieveCache();
    }

    #retrieveCache() {

        this.#cache = getCache(this.originClass, self(this), ...(this.#options || []));
        this.#verifyCache();
    }

    #verifyCache() {

        this.#isCached = isValidCache(this.#cache);

        if (!this.#isCached) {

            this.#cache = undefined;
        }
    }

    _cache(meta) {
        
        setCache(meta, this.originClass, self(this), ...(this.#options || []));
    }

    /**
     * 
     * @param {Object} options 
     * @param {boolean} options.deepCriteria
     * @returns 
     */
    mirror(options) {

        return this.#reflectionAspect.query(options);
    }
}