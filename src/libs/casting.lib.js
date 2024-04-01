const Reflector = require("../metadata/reflector");
const ReflectorContext = require("../metadata/reflectorContext");
const { CASTED_TYPE, VPTR, TYPE_ENFORCEMENT_TRAPS } = require("./constant");
const { isPrimitive, isValuable, matchType, getTypeOf } = require("./type");
const { setVPtrOf, releaseVPtrOf, getVPtrOf } = require("./typeEnforcement.lib");


//const CASTED_TYPE = Symbol('_casted_type');

const WHILE_lIST = new Set([
    '__is', '__implemented'
])

// const traps = {
//     get(target, key) {

//         if (key === CASTED_TYPE) {

//             return this[CASTED_TYPE];
//         }

//         restrictAbstractUndeclaredMethod(this[CASTED_TYPE], target, key);
//         const target_prop = target[key];
//         return target_prop;
//     },
//     set(target, key, val) {

//         if (
//             key === CASTED_TYPE
//         ) {
//             this[CASTED_TYPE] = val;
//         }
//         else {
//             target[key] = val;
//         }
        
//         return true;
//     }
// }

// const const_cast_traps = {
//     get(target, key) {

//         if (key === CASTED_TYPE) {

//             return this[CASTED_TYPE];
//         }

//         const castedType = this[CASTED_TYPE];
//         restrictAbstractUndeclaredMethod(castedType, target, key);
        
//         const targetProp = target[key];
//         const castedTypeProp = castedType.prototype[key];

//         // if () {


//         // }
//     },
//     set: traps.set,
//     getPrototypeOf() {

//         return this[CASTED_TYPE];
//     },
//     setPrototypeOf() {

//         throw new Error('could not set prototype of object that is casted as const_cast()');
//     }
// }

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

    return getVPtrOf(object);

    // if (!isValuable(object)) {

    //     return undefined;
    // }

    // return object[CASTED_TYPE];
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

    // if (
    //     !meetPrerequisites(target)
    // ) {
    //     return target;
    // }

    // if (
    //     !matchType(_t, target) 
    //     && _t !== Object
    //     && !isPrimitive(target)
    // ) {

    //     throw new TypeError();
    // }
    
    // const ret = new Proxy(
    //     isPrimitive(target) ? new (getTypeOf(target))(target) : target
    //     ,
    //     {
    //         [CASTED_TYPE]: _t,
    //         [VPTR]: target?.[VPTR],
    //         ...TYPE_ENFORCEMENT_TRAPS,
    //     }
    // );
    // //console.timeEnd('cast');
    // return ret;

    return setVPtrOf(_t, target);
}

/**
 * 
 * @param {Object|any} target 
 * @returns {Object|any}
 */
function dynamic_cast(target) {

    // releaseTypeCast(target);

    // return target;

    //return static_cast(getTypeOf(target), target);

    return releaseVPtrOf(target);
}

function const_cast(target) {


}

function meetPrerequisites(target) {

    return isValuable(target)
}