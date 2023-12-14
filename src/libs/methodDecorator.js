const {metaOf, metadata_t, property_metadata_t} = require('../reflection/metadata.js');
const {METADATA, TYPE_JS} = require('../constants.js');
const {hasFootPrint, setFootPrint} = require('./footPrint.js');
const matchType = require('./matchType.js');
const {compareArgsWithType} = require('../libs/argumentType.js');
const isIterable = require('../utils/isIterable.js');
const ReturnValueNotMatchType = require('../error/returnValueNotMatchTypeError.js');
const isAbStract = require('../utils/isAbstract.js');
const { DECORATED_VALUE } = require('./constant.js');


function generateDecorateMethod(_method, propMeta) {

    if (typeof _method !== 'function') {

        throw new TypeError('the object passed as argument to _method is not a function');
    }

    /**@type {property_metadata_t} */
    //const propMeta = metaOf(_method) ?? new property_metadata_t();

    const func =  function() {

        const injectedArgs = getInjectedArguments(this, propMeta.name ?? _method.name);

        const defaultArguments = propMeta.value;

        const args = arguments.length !== 0 ? arguments : injectedArgs ?? (isIterable(defaultArguments) ? defaultArguments : [defaultArguments]);

        compareArgsWithType(propMeta, args);

        const returnValue = _method.call(this, ...args);
        
        const {allowNull, type} = propMeta;

        return checkReturnTypeAndResolve(returnValue, type, propMeta);
    }

    const decoratedMethod = propMeta.footPrint.decoratedMethod ??= func;

    decoratedMethod[METADATA] ??= {};
    decoratedMethod[METADATA][TYPE_JS] ??= propMeta;
}

/**
 * 
 * @param {Object} _object 
 * @param {string || Symbol} _methodName 
 * 
 * @returns {Array?}
 */
function getInjectedArguments(_object, _methodName) {

    /**@type {metadata_t} */
    const meta = metaOf(_object);

    if (meta?.constructor !== metadata_t) {

        return undefined;
    }

    const wrapper = meta.properties[_methodName];
    
    if (!Array.isArray(wrapper)) {

        return undefined;
    }
    
    const [extraMeta, propMeta] = wrapper;

    if (propMeta?.constructor !== property_metadata_t) {

        return undefined;
    }

    const injectedArgs = extraMeta?.defaultArguments;

    return Array.isArray(injectedArgs) && injectedArgs.length > 0 ? injectedArgs : undefined;
}

function checkReturnTypeAndResolve(_returnValue, _expectType, _propMeta) {

    const handleReturnType = checkReturnValueWith(_expectType, _propMeta);

    if (_returnValue instanceof Promise) {

        _returnValue = _returnValue.then(handleReturnType);
    }
    else {

        handleReturnType(_returnValue);
    }

    return _returnValue;
}

function checkReturnValueWith(expectReturnType, _propMeta) {
    
    const {allowNull} = _propMeta;
    return function (returnValue) {

        //const { expectReturnType, isAsync } = this;

        const valueIsNull = returnValue === undefined || returnValue === null;

        // expectReturnType must be a class, if undefined, the return type is unnecessary
        const match = isAbStract(expectReturnType) ? matchType(expectReturnType, returnValue) : true;
        // undefined and null are treated as primitive value called Void
        if (match) {

            return returnValue;
        }

        if (valueIsNull && allowNull) {
            
            return returnValue;
        }

        throw new ReturnValueNotMatchType(expectReturnType, returnValue, _propMeta);
    }
}

// function resolveMethodTypeMeta(_method, _propMeta) {

//     _method[METADATA] ??= {};

//     const actualMeta = _method[METADATA][TYPE_JS] ??= _propMeta;

//     actualMeta.isMethod = true;

//     initFootPrint(actualMeta);

//     decorateMethod(_method);

//     return actualMeta;
// }

function decorateMethod(_method, context, propMeta) { 

    if (typeof _method !== 'function') {

        return;
    }

    if (!propMeta) {

        return;
    }

    if (hasFootPrint(_method, context, DECORATED_VALUE)) {

        return;
    }

    const {addInitializer, name} = context;
    const newMethod = generateDecorateMethod(_method, propMeta);

    setFootPrint(_method, context, DECORATED_VALUE, newMethod);

    addInitializer(function () {
        
        if (propMeta.initialized === true) {

            return;
        }

        this[name] = newMethod;
        propMeta.initialized = true;
    })

    return newMethod;
}


module.exports = {decorateMethod};