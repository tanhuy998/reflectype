const Reflector = require("../metadata/reflector");
const ReflectorContext = require("../metadata/reflectorContext");
const { isPrimitive, isValuable, matchType, getTypeOf } = require("./type");

const CASTED_TYPE = Symbol('_casted_type');
const WHILE_lIST = new Set([
    '__is', '__implemented'
])

const traps = {
    get(target, key) {

        if (key === CASTED_TYPE) {

            return this[CASTED_TYPE];
        }

        restrictAbstractUndeclaredMethod(this[CASTED_TYPE], target, key);
        const target_prop = target[key];
        return target_prop;
    },
    set(target, key, val) {

        if (
            key === CASTED_TYPE
        ) {
            this[CASTED_TYPE] = val;
        }
        else {
            target[key] = val;
        }
        
        return true;
    }
}

const const_cast_traps = {
    get(target, key) {

        if (key === CASTED_TYPE) {

            return this[CASTED_TYPE];
        }

        const castedType = this[CASTED_TYPE];
        restrictAbstractUndeclaredMethod(castedType, target, key);
        
        const targetProp = target[key];
        const castedTypeProp = castedType.prototype[key];

        // if () {


        // }
    },
    set: traps.set,
    getPrototypeOf() {

        return this[CASTED_TYPE];
    },
    setPrototypeOf() {

        throw new Error('could not set prototype of object that is casted as const_cast()');
    }
}

module.exports = {
    getCastedTypeOf,
    //releaseTypeCast,
    static_cast,
    dynamic_cast,
    const_cast,
}

/**
 * 
 * @param {Function} abstract 
 * @param {Object|Function} target
 * @param {string|symbol} key 
 * 
 * @throws
 */
function restrictAbstractUndeclaredMethod(abstract, target, key) {

    const reflector = new Reflector(target);
    const isInstance = reflector.reflectionContext === ReflectorContext.INSTANCE;

    if (!isInstance) {

        return;
    }

    const targetProp = target[key];
    const prototypeProp = abstract.prototype[key];

    if (
        typeof targetProp === 'function' &&
        typeof prototypeProp !== 'function' &&
        !WHILE_lIST.has(key)
    ) {
        throw new ReferenceError(`[${abstract?.name}] has no method named ${key}.()`);
    }
}

function getCastedTypeOf(object) {
    //console.time(2)

    // const f = object?.[CASTED_TYPE];
    // let ret = typeof f === 'function' ? f() : undefined;

    //console.timeEnd(2)
    return object[CASTED_TYPE] || undefined;
}

function releaseTypeCast(object) {

    if (
        !meetPrerequisites(object)
    ) {

        return;
    }

    object[CASTED_TYPE] = undefined;
}

/**
 * 
 * @param {Function} _t 
 * @param {Object|any} target 
 * @returns {Object|any}
 */
function static_cast(_t, target) {

    if (
        !meetPrerequisites(target)
    ) {
        return target;
    }

    if (!matchType(_t, target)) {

        throw new TypeError();
    }

    // let cast_t = _t;
    // let pre = Date.now();

    // target[CASTED_TYPE] = () => {

    //     const ret = Date.now() === pre ? cast_t : undefined;
    //     cast_t = undefined;
    //     pre = undefined;

    //     return ret;
    // };

    // return target;
    //console.time('cast');
    const ret = new Proxy(target, {
        [CASTED_TYPE]: _t,
        ...traps,
    });
    //console.timeEnd('cast');
    return ret;
}

/**
 * 
 * @param {Object|any} target 
 * @returns {Object|any}
 */
function dynamic_cast(target) {

    // releaseTypeCast(target);

    // return target;

    return static_cast(getTypeOf(target), target);
}

function const_cast(target) {


}

function meetPrerequisites(target) {

    return !isPrimitive(target) && isValuable(target)
}