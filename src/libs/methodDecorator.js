const {metaOf} = require('../reflection/metadata.js');
const {METADATA, TYPE_JS} = require('../constants.js');
const initFootPrint = require('./initFootPrint.js');
const matchType = require('./matchType.js');
const {compareArgsWithType} = require('../libs/argumentType.js');
const isIterable = require('../utils/isIterable.js');
const ReturnValueNotMatchType = require('../error/returnValueNotMatchTypeError.js');

function decorateMethod(_method) {

    if (typeof _method !== 'function') {

        throw new TypeError('the object passed as argument to _method is not a function');
    }

    /**@type {property_metadata_t} */
    const propMeta = metaOf(_method) ?? new property_metadata_t();

    const func =  function() {

        const defaultArguments = propMeta.value;

        const args = arguments.length !== 0 ? [...arguments] : isIterable(defaultArguments) ? defaultArguments : [];

        compareArgsWithType(propMeta, args);

        const returnValue = _method.call(this, ...args);
        
        const {allowNull, type} = propMeta;

        return checkReturnTypeAndResolve(returnValue, type, propMeta);
    }

    const decoratedMethod = propMeta.footPrint.decoratedMethod ??= func;

    decoratedMethod[METADATA] ??= {};
    decoratedMethod[METADATA][TYPE_JS] ??= propMeta;
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

        const match = matchType(expectReturnType, returnValue);
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

function resolveMethodTypeMeta(_method, _propMeta) {

    _method[METADATA] ??= {};

    const actualMeta = _method[METADATA][TYPE_JS] ??= _propMeta;

    actualMeta.isMethod = true;

    initFootPrint(actualMeta);

    decorateMethod(_method);

    //actualMeta.footPrint.decoratedMethod = decorateMethod;

    return actualMeta;
}


module.exports = {resolveMethodTypeMeta, decorateMethod};