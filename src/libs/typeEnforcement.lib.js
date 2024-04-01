const Reflector = require("../metadata/reflector");
const ReflectorContext = require("../metadata/reflectorContext");
const { VPTR, TYPE_ENFORCEMENT_TRAPS, CASTED_TYPE } = require("./constant");
const { isPrimitive, isValuable, matchType, getTypeOf } = require("./type");


const WHILE_lIST = new Set([
    '__is', '__implemented'
])

const traps = {
    get(target, key) {

        if (key === VPTR) {

            return this[VPTR];
        }

        restrictAbstractUndeclaredMethod(this[VPTR], target, key);
        const target_prop = target[key];
        return target_prop;
    },
    set(target, key, val) {

        if (
            key === VPTR
        ) {
            this[VPTR] = val;
        }
        else {
            target[key] = val;
        }
        
        return true;
    }
}

const const_cast_traps = {
    get(target, key) {

        if (key === VPTR) {

            return this[VPTR];
        }

        const castedType = this[VPTR];
        restrictAbstractUndeclaredMethod(castedType, target, key);
        
        const targetProp = target[key];
        const castedTypeProp = castedType.prototype[key];

        // if () {


        // }
    },
    set: traps.set,
    getPrototypeOf() {

        return this[VPTR];
    },
    setPrototypeOf() {

        throw new Error('could not set prototype of object that is casted as const_cast()');
    }
}

module.exports = {
    getVPtrOf,
    //releaseTypeCast,
    setVPtrOf,
    releaseVPtrOf,
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

function getVPtrOf(object) {

    if (!isValuable(object)) {

        return undefined;
    }

    return object[VPTR];
}

function releaseTypeCast(object) {

    if (
        !meetPrerequisites(object)
    ) {

        return;
    }

    object[VPTR] = undefined;
}

/**
 * 
 * @param {Function} _t 
 * @param {Object|any} target 
 * @returns {Object|any}
 */
function setVPtrOf(_t, target) {

    if (
        !meetPrerequisites(target)
    ) {
        return target;
    }

    if (
        !matchType(_t, target) 
        && _t !== Object
        && !isPrimitive(target)
    ) {

        throw new TypeError();
    }
    
    const ret = new Proxy(
        isPrimitive(target) ? new (getTypeOf(target))(target) : target
        ,
        {
            [VPTR]: _t,
            //[CASTED_TYPE]: target?.[CASTED_TYPE],
            ...traps,
        }
    );
    //console.timeEnd('cast');
    return ret;
}

/**
 * 
 * @param {Object|any} target 
 * @returns {Object|any}
 */
function releaseVPtrOf(target) {

    // releaseTypeCast(target);

    // return target;

    return setVPtrOf(getTypeOf(target), target);
}

function const_cast(target) {


}

function meetPrerequisites(target) {

    return isValuable(target)
}