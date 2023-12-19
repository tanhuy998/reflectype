const {metaOf, metadata_t, property_metadata_t} = require('../reflection/metadata.js');
const {hasFootPrint, setFootPrint} = require('./footPrint.js');
const matchType = require('./matchType.js');
const {compareArgsWithType} = require('../libs/argumentType.js');
const {isIterable} = require('./type.js');
const ReturnValueNotMatchType = require('../error/returnValueNotMatchTypeError.js');
const isAbStract = require('../utils/isAbstract.js');
const { DECORATED_VALUE } = require('./constant.js');
const self = require('../utils/self.js');
const { METADATA } = require('../constants.js');


function generateDecorateMethod(_method, propMeta) {

    if (typeof _method !== 'function') {

        throw new TypeError('the object passed as argument to _method is not a function');
    }
    
    return function() {

        const injectedArgs = getInjectedArguments(this, propMeta.name ?? _method.name);
        const defaultArguments = propMeta.value;
        const args = arguments.length !== 0 ? arguments : injectedArgs ?? (isIterable(defaultArguments) ? defaultArguments : [defaultArguments]);

        compareArgsWithType(propMeta, args);

        const returnValue = _method.call(this, ...args);
        const {type} = propMeta;

        return checkReturnTypeAndResolve(returnValue, type, propMeta);
    }
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

/**
 * 
 * @param {Function} _method 
 * @param {Object} context 
 * @param {property_metadata_t} propMeta 
 * @returns 
 */
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

    addInitializer(function () {
        
        if (propMeta.isInitialized === true) {

            return;
        }
        
        /**
         * just call this once when the first instance of a class initialized
         */
        detectProtoypeAndGenerateMethod(this, name, propMeta, context);

        propMeta.isInitialized = true;
    })
}

/**
 * decorator AddInitializer() is called before class constructors so it overrides the object 
 * property into a form that is different from class's prototype.
 * 
 * @param {Object} _obj 
 * @param {string|Symbol} _methodName 
 * @param {property_metadata_t} propMeta 
 * @returns 
 */
function detectProtoypeAndGenerateMethod(_obj, _methodName, propMeta, decoratorContext) {

    const abstract = self(_obj);
    const {metadata} = decoratorContext;
    const prototypeMethod = _obj[_methodName];

    if (abstract[METADATA] === metadata) {
        /**
         *  to ensure the current decorator context belongs to the top derived class's prototype
         *  in order to prevent base class decorators override subclass's prototype.
         */
        abstract.prototype[_methodName] = generateDecorateMethod(prototypeMethod, propMeta);
    }

    //abstract.prototype[_methodName] =  prototypeMethod;
}


module.exports = {decorateMethod};