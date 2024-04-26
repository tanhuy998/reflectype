const { isProxy } = require("util/types");
const { Interface } = require("../interface");
const Reflector = require("../metadata/reflector");
const ReflectorContext = require("../metadata/reflectorContext");
//const { VPTR, TYPE_ENFORCEMENT_TRAPS, CASTED_TYPE } = require("./constant");
const { isPrimitive, isValuable, matchType, getTypeOf } = require("./type");


const WHILE_lIST = new Set([
    '__is', '__implemented', 'constructor'
])

const VPTR = Symbol('vPtr');

const ORIGIN_OBJECT = Symbol('_origin_object');

const traps = {
    get(target, key, receiver) {

        if (
            key === VPTR
            || key === ORIGIN_OBJECT
        ) {

            return this[key];
        }
        
        return dispatchPotentialFunction(target, this, key) || target[key];
    },
    set(target, key, val) {

        if (
            key === VPTR
        ) {
            //this[VPTR] = val;

            return false;
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
    getVPtrOf: _getVPtrOf,
    //releaseTypeCast,
    setVPtrOf: _setVPtrOf,
    releaseVPtrOf: _releaseVPtrOf,
    _getVPtrOf,
    _setVPtrOf,
    _releaseVPtrOf,
}

/**
 * 
 * @param {object|Function} target 
 * @param {Proxy} wrapper 
 * @param {string|symbol} key 
 * @returns 
 */
function dispatchPotentialFunction(target, wrapper, key) {

    /**@type {Function|typeof Interface} */
    const vPtr = wrapper[VPTR] || getTypeOf(target);
    const vPtrIsInterface = vPtr.prototype instanceof Interface;
    const proto = vPtrIsInterface ? retrieveInterfaceImplementer(target, vPtr).prototype : vPtr.prototype;
    
    if (
        typeof Reflect.get(proto, key, proto) !== 'function'
        || WHILE_lIST.has(key)
    ) {

        return undefined;
    }
    
    return wrappFunction(Reflect.get(proto, key, proto), target);
}

/**
 * wrap the function retrieved by proxy getter in order to release
 * virtual pointer of the binder.
 * 
 * @param {function} _func 
 * @param {object|Function} binder 
 * @returns 
 */
function wrappFunction(_func, binder) {
    
    binder = _releaseVPtrOf(binder);

    return function() {
        
        return _func.apply(binder, arguments);
    }
}

function retrieveInterfaceImplementer(instance, Interface) {

    const reflector = new Reflector(instance);
    
    return reflector.metadata.interfaces.list.get(Interface);
}

function getPrototypeProperty(name) {

    return this[name];
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

function _getVPtrOf(object) {

    if (typeof object === 'function') {

        throw new TypeError('classes or functions could not own virtual pointer');
    }

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
function _setVPtrOf(_t, target) {

    if (typeof _target === 'function') {

        throw new TypeError('setting virtual pointer to class or function is not allowed.');
    }

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
            [ORIGIN_OBJECT]: target,
            //[CASTED_TYPE]: target?.[CASTED_TYPE],
            ...traps,
        }
    );
    //console.timeEnd('cast');
    return ret;
}

function preventClass(_target) {


}

/**
 * 
 * @param {Object|any} target 
 * @returns {Object|any}
 */
function _releaseVPtrOf(target) {

    if (typeof object === 'function') {

        throw new TypeError('classes or functions could not own virtual pointer');
    }

    // releaseTypeCast(target);

    // return target;
    
    //return setVPtrOf(getTypeOf(target), target);
    return target?.[ORIGIN_OBJECT] || target;
}

function const_cast(target) {


}

function meetPrerequisites(target) {

    return isValuable(target)
}