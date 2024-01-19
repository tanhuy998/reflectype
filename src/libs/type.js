const Void = require('../type/void.js');
const {IS_CHECKABLE} = require('../interface/constant.js');
const Any = require('../type/any.js');
const Interface = require('../interface/interface');
const { IS_DECORATOR } = require('../utils/decorator/constant.js');

const OBJECT_KEY_TYPES = ['number', 'string', 'symbol'];
const INSTANTIABLE_BLACK_LIST = [Interface, Void, Function];
const PRIMITIVES_CLASS_NAMES = ['Boolean', 'String', 'Number', 'BigInt', Void.name];
const PRIMITIVE_CLASS_NAMES_MAP = {
    'string': 'String',
    'boolean': 'Boolean',
    'number': 'Number',
    'bigint': 'BigInt',
    'undefined': Void.name,
}

module.exports = {
    isParent,
    isParentOrFail,
    matchType, 
    matchTypeOrFail,
    isPrimitive, 
    isIterable, 
    isValuable,
    isObject,
    isObjectOrFail, 
    isIterableOrFail, 
    isPrimitiveOrFail, 
    isValuableOrFail,
    isInstantiable,
    isInstantiableOrFail,
    isFuntion,
    isFunctionOrFail,
    isObjectLike,
    isObjectLikeOrFail,
    isObjectKey,
    isObjectKeyOrFail,
    isNonIterableObjectKey,
    isNonIterableObjectKeyOrFail,
    isFunctionParamIdentifier,
    isFunctionParamIdentifierOrFail,
    isAbstract,
    isAbstractOrFail,
    isDecorator
}

/**
 * 
 * @param {Function} func 
 */
function isDecorator(func) {

    return typeof func === 'function' && func[IS_DECORATOR] === true;
}

function isAbstract(_class) {

    return isInstantiable(_class) || 
            _class instanceof Interface || 
            _class === Function;
}

function isAbstractOrFail(_class) {

    if (!isAbstract(_class)) {

        throw new Error();
    }

    return true;
}

function isFunctionParamIdentifier(_key) {

    return typeof _key === 'string';
}

function isFunctionParamIdentifierOrFail(_key) {

    if (!isFunctionParamIdentifier(_key)) {

        throw new Error();
    }

    return true;
}

/**
 * 
 * @param {Object} base 
 * @param {Object} derived 
 * @returns 
 */
function isParent(base, derived) {

    typeof base === 'function' &&
    typeof derived === 'function' &&
    derived.prototype instanceof base;
}

function isParentOrFail(base, derived) {

    if (!isParent(...arguments)) {

        throw new Error;
    }

    return true;
}

function matchType(_type, value) {
    
    if (_type instanceof Any || _type?.prototype instanceof Any) {

        return true;
    }

    if (value instanceof _type) {

        return true;
    }

    // if _type is annotated as primitive types
    // is must be a boxed primitive
    if (isPrimitive(_type) && isPrimitive(value)) {

        if (_type.name === value?.name) {
            
            return true;
        }
        
        const strictType = value === null ? 
                            Void.name 
                            : PRIMITIVE_CLASS_NAMES_MAP[typeof value];

        return strictType === _type.name;
    }

    if (!isPrimitive(_type)) {
        
        if  (!isPrimitive(value)) {
            
            return (value[IS_CHECKABLE]) ? 
                    value.__is(_type) 
                    : value instanceof _type;
        }

        return false;
    }
}

function matchTypeOrFail(_type, value) {

    if (!matchType(_type, value)) {

        throw new TypeError();
    }

    return true;
}

function isPrimitive(value) {

    return (typeof value !== 'object' && typeof value !== 'function') || 
            value === null || 
            value === undefined || 
            PRIMITIVES_CLASS_NAMES.includes(value.name);
}


function isIterable(_object) {

    return typeof _object === 'object' && typeof _object[Symbol.iterator] === 'function';
}

function isObject(_unknown) {

    return typeof _unknown === 'object';
}

/**
 * 
 * @param {Object?} _target 
 * @throws {TypeError}
 */
function isObjectOrFail(_target) {

    if (!isObject(_target)) {

        throw new TypeError();
    }

    return true;
}

function isIterableOrFail(_object) {

    if (!isIterable(_object)) {

        throw new TypeError();
    }

    return true;
}

function isPrimitiveOrFail(_value) {

    if (!isPrimitive(_value)) {

        throw new TypeError();
    }

    return true;
}

function isValuable(_unknown) {

    return _unknown !== undefined && _unknown !== null;
}

function isValuableOrFail(_unknown) {

    if (!isValuable(_unknown)) {

        throw new TypeError();
    }

    return true;
}


function isInstantiable(_type) {

    return typeof _type === 'function' && 
    typeof _type.prototype === 'object' &&
    (
        !INSTANTIABLE_BLACK_LIST.includes(_type) ||
        !(_type.prototype instanceof Interface)
    );
}

function isInstantiableOrFail(_type) {

    if (!isInstantiable(_type)) {

        throw new TypeError();
    }

    return true;
}

function isFuntion(_unknown) {

    return typeof _unknown === 'function';
}

function isFunctionOrFail(_unknown) {

    if (!isFuntion(_unknown)) {

        throw new TypeError();
    }
    return true;
}

function isObjectLike(_unknown) {

    return isObject(_unknown) || isFuntion(_unknown);
}

function isObjectLikeOrFail(_unknown) {

    if (!isObjectLike(_unknown)) {

        throw new TypeError();
    }

    return true;
}

function isObjectKey(_unknown) {

    const type = typeof _unknown;

    return OBJECT_KEY_TYPES.includes(type);
}

function isObjectKeyOrFail(_unknown) {

    if (!isObjectKey(_unknown)) {

        throw new TypeError();
    }

    return true;
}

function isNonIterableObjectKey(_value) {

    return isObjectKey(_value) && typeof _value !== 'number';
}

function isNonIterableObjectKeyOrFail(_value) {

    if (!isNonIterableObjectKey(_value)) {

        throw new TypeError();
    }

    return true;
}