const {metaOf} = require('../reflection/metadata.js');
const {METADATA, TYPE_JS} = require('../constants.js');
const initFootPrint = require('./initFootPrint.js');
const matchType = require('./matchType.js');

function decorateMethod(_method) {

    /**@type {property_metadata_t} */
    const propMeta = metaOf(_method) ?? new property_metadata_t();

    const func =  function() {

        const defaultArguments = propMeta.value;

        const args = defaultArguments ?? arguments;

        const returnValue = _method.call(this, ...args);
        
        const {allowNull, type} = propMeta;

        return checkReturnTypeAndResolve(returnValue, type, allowNull);
    }

    const decoratedMethod = propMeta.footPrint.decoratedMethod ??= func;

    decoratedMethod[METADATA] ??= {};
    decoratedMethod[METADATA][TYPE_JS] ??= propMeta;
}

function checkReturnTypeAndResolve(_retunrValue, _expectType, allowNull) {

    // const args = arguments.length !== 0 ? arguments : propMeta.value || [];

    // const result = _method.call(this, ...args);

    // const invocationContext = {
    //     expectReturnType: _abstract, 
    //     isAsync: false,
    // }

    if (_retunrValue instanceof Promise) {

        //invocationContext.isAsync = true;

        _retunrValue.then(checkReturnValueWith(_expectType, allowNull));
    }
    else {

        checkReturnValueWith(_expectType, allowNull)(_retunrValue);
    }

    return _retunrValue;
}

function checkReturnValueWith(expectReturnType, allowNull = false) {

    return function (returnValue) {

        //const { expectReturnType, isAsync } = this;

        let error = false;

        const isNull = returnValue === undefined || returnValue === null;

        if (isNull) {
            
            if (allowNull) {

                return returnValue;
            }
            else {

                error = true;
            }
        }

        if (!matchType(expectReturnType, returnValue)) {

            error = true;
        }

        if (error) {

            throw new TypeError('The return value of function is not match return type');
        }

        return returnValue;
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


module.exports = {resolveMethodTypeMeta, decorateMethod, checkReturnTypeAndResolve, matchType, checkReturnValueWith};