const Void = require('../type/void.js');
const {IS_CHECKABLE} = require('../constants.js');
const Any = require('../type/any.js');

function matchType(_type, value) {
    
    if (_type instanceof Any || _type?.prototype instanceof Any) {

        return true;
    }

    if (value instanceof _type) {

        return true;
    }

    const transferToBoxedPrimitive = {
        'string': 'String',
        'boolean': 'Boolean',
        'number': 'Number',
        'bigint': 'BigInt',
        'undefined': Void.name,
    }

    // if _type is annotated as primitive types
    // is must be a boxed primitive
    if (isPrimitive(_type) && isPrimitive(value)) {

        if (_type.name === value?.name) {
            
            return true;
        }
        
        const strictType = value === null ? Void.name : transferToBoxedPrimitive[typeof value];
        
        return strictType === _type.name;
    }

    if (!isPrimitive(_type)) {
        
        if  (!isPrimitive(value)) {
            
            return (value[IS_CHECKABLE]) ? value.__is(_type) : value instanceof _type;
        }

        return false;
    }
}

function isPrimitive(value) {

    const boxedPrimitiveTypes = ['Boolean', 'String', 'Number', 'BigInt', Void.name];

    return (typeof value !== 'object' && typeof value !== 'function') || value === null || value === undefined || boxedPrimitiveTypes.includes(value.name);
}


function isIterable(_object) {

    return typeof _object === 'object' && typeof _object[Symbol.iterator] === 'function';
}

/**
 * 
 * @param {Object?} _target 
 * @throws {TypeError}
 */
function isObjectOrFasle(_target) {

    if (typeof _target !== 'object') {

        throw new TypeError();
    }

    return true;
}

function isIterableOrFalse(_object) {

    if (!isIterable(_object)) {

        throw new TypeError();
    }

    return true;
}

function isPrimitiveOrFalse(_value) {

    if (!isPrimitive(_value)) {

        throw new TypeError();
    }

    return true;
}

function isValuable(_unknown) {

    return _unknown !== undefined && _unknown !== null;
}

function isValuableOrFalse(_unknown) {

    if (!isValuable(_unknown)) {

        throw new TypeError();
    }

    return true;
}


function isInstantiable(_type) {

    return typeof _type === 'function' && typeof _type.prototype === 'object';
}

function isInstantiableOrFalse(_type) {

    if (!isInstantiable(_type)) {

        throw new TypeError();
    }
}
 
module.exports = { 
    matchType, 
    isPrimitive, 
    isIterable, 
    isValuable,
    isObjectOrFasle, 
    isIterableOrFalse, 
    isPrimitiveOrFalse, 
    isValuableOrFalse,
    isInstantiable,
    isInstantiableOrFalse
}  