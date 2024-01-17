const {metaOf, metadata_t, property_metadata_t, prototype_metadata_t, PROP_META_INITIALIZED, function_metadata_t} = require('../reflection/metadata.js');
const {decoratorHasFootPrint, setDecoratorFootPrint, getMetadataFootPrintByKey} = require('./footPrint.js');
const matchType = require('./matchType.js');
const {compareArgsWithType} = require('../libs/argumentType.js');
const {isIterable, isInstantiable} = require('./type.js');
const ReturnValueNotMatchType = require('../error/returnValueNotMatchTypeError.js');
const isAbStract = require('../utils/isAbstract.js');
const self = require('../utils/self.js');
const { belongsToCurrentMetadataSession } = require('./metadata/metadataTrace.js');
const {
    DECORATED_VALUE,
    ORIGIN_VALUE,
} = require('./constant.js');
const { resolveTypeMetaResolution } = require('./metadata/resolution.js');
const { extractFunctionInformations } = require('../utils/function.util.js');

module.exports = {
    decorateMethod, 
    refreshMeta
};

/**
 * 
 * @param {Function} _method 
 * @param {property_metadata_t} propMeta 
 * @returns 
 */
function generateDecorateMethod(_method, propMeta) {

    if (typeof _method !== 'function') {

        throw new TypeError('the object passed as argument to _method is not a function');
    }
    
    return function() {

        //const functionMeta = propMeta.functionMeta;
        const injectedArgs = getInjectedArguments(this, propMeta.name ?? _method.name);
        const defaultArguments = propMeta.functionMeta.defaultArguments;
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

        throw new ReturnValueNotMatchType({
            type: expectReturnType, 
            value: returnValue, 
            metadata: _propMeta
        });
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

    //refreshMeta(propMeta);
    discoverParams(propMeta);

    if (!decoratorHasFootPrint(_method, context, DECORATED_VALUE)) {

        setDecoratorFootPrint(_method, context, DECORATED_VALUE, generateDecorateMethod(_method, propMeta));
    }

    propMeta.decoratorContext = context;
    propMeta.isInitialized = true;

    context.addInitializer(overrideClassPrototype(propMeta));
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function refreshMeta(propMeta) {

    const functionMeta = propMeta.functionMeta ??= new function_metadata_t(propMeta);
    functionMeta.returnType = propMeta.type;
    functionMeta.allowNull = propMeta.allowNull;
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * @returns 
 */
function discoverParams(propMeta) {

    //const funcMeta = propMeta.functionMeta;

    if (propMeta.funcMeta?.isDiscovered === true) {
        
        return;
    }

    if (!propMeta.isMethod) {

        return;
    }

    const actualFunc = getMetadataFootPrintByKey(propMeta, ORIGIN_VALUE);
    const funcMeta = propMeta.functionMeta = extractFunctionInformations(actualFunc);
    funcMeta.isDiscovered = true;
}

// /**
//  * 
//  * @param {property_metadata_t} propMeta 
//  * @returns 
//  */
// function discoverParams(propMeta) {

//     const funcMeta = propMeta.functionMeta;

//     if (funcMeta?.isDiscovered === true) {
        
//         return;
//     }

//     if (!propMeta.isMethod) {

//         return;
//     }

//     const functionIdentifier = getMetadataFootPrintByKey(propMeta, ORIGIN_VALUE)
//                     ?.toString()
//                     ?.replace(REGEX_FUNCTION_BODY_DETECT, '')
//                     ?.match(REGEX_FUNCTION_DETECT);
    
//     if (!functionIdentifier) {

//         throw new TypeError('invalid function returned by _getActualFunction');
//     }

//     let paramList = functionIdentifier[FUNCTION_PARAMS]
//                         //?.replace(REGEX_DEFAULT_ARG, '')
//                         //?.replace(WHITE_SPACE, '')
//                         ?.split(REGEX_PARAM_SEPERATOR);
    
//     if (config.reflectypeOfficialDecorator) {
//         /**
//          * This section just invoke when decorator feature officially
//          * turn on on Javascript because of babel tranform a lot of 
//          * information of the original function.
//          */
//         paramList = paramList.map(resovleParamName);
//     }
//     console.log(paramList)
//     funcMeta.paramsName = hasNoParam(paramList) ? [] : paramList;
//     funcMeta.isDiscovered = true;
// }

// function resovleParamName(str) {

//     if (typeof str !== 'string') {

//         return str;
//     }

//     return str.replace(REGEX_DECORATOR_DETECT, '')
//             .replace(REGEX_DEFAULT_ARG, '');
// }

// /**
//  * 
//  * @param {Array<string>} _list 
//  * @returns 
//  */
// function hasNoParam(_list) {

//     return _list.length === 0 ||
//             _list.length === 1 &&
//             !_list[0];
// }

/**
 * @description
 *  Override class's prototype when decorators take effect on a particular class.
 *  This method has multiple use cases, it can be invoke when a new (method) decorated object
 *  is created or is invoked by Reflection objects if they noticed that the class which they reflect
 *  is not (fully) initialized. The Initilization is just established once and is marked "isInitialized" 
 *  when the initialization is done.
 * 
 * @param {property_metadata_t} propMeta
 * 
 * @returns {Function}
 */
function overrideClassPrototype(propMeta) {

    /**
     * @this {Function|Object}
     */
    return function () {
        /**
         *  *this method must be bound to any object
         */
        resolveTypeMetaResolution(self(this), propMeta.owner.typeMeta);
        establishClassPrototypeMethod(this, propMeta);

        if (propMeta.isInitialized) {

            unlinkDecoratorContext(propMeta);
        }
    }
}

/**
 * @description
 * decorator AddInitializer() is called before class constructors so it overrides the object 
 * property into a form that is different from class's prototype.
 * 
 * @param {Object} _obj 
 * @param {string|Symbol} _methodName 
 * @param {property_metadata_t} propMeta 
 * @returns 
 */
function establishClassPrototypeMethod(_unknown, propMeta) {

    const abstract = !isInstantiable(_unknown) ? self(_unknown) : _unknown;

    if (propMeta.isInitialized === true) {

        return;
    }

    const decoratorContext = propMeta.decoratorContext;
    const {name} = decoratorContext;
    const isStaticMethod = decoratorContext.static;
    const oldMethod = isStaticMethod ? abstract[name] : abstract.prototype[name];

    let newMethod;
    
    if (belongsToCurrentMetadataSession(decoratorContext)) {
        
        newMethod = generateDecorateMethod(oldMethod, propMeta);
        unlinkDecoratorContext(propMeta);
    }
    else {
        /**
         * otherwise, rearrange the propMeta of the subclass because the inherited propMeta 
         * is not subclass actual propMeta
         */
        unlinkPropMeta(abstract, decoratorContext);

        newMethod = oldMethod;
    }

    linkTypeMetaAbstract(abstract);

    /**
     *  to ensure the current decorator context belongs to the top derived class's prototype
     *  in order to prevent base class decorators override subclass's prototype.
     */
    if (isStaticMethod) {

        abstract[name] = newMethod;
    }
    else {

        abstract.prototype[name] = newMethod;
    }

    Object.defineProperty(propMeta, 'isInitialized', PROP_META_INITIALIZED);
}


function linkTypeMetaAbstract(_class) {

    const typeMeta = metaOf(_class);

    if (!(typeMeta instanceof metadata_t)) {

        return;
    }

    typeMeta.abstract = _class;

    if (!(typeMeta._prototype instanceof prototype_metadata_t)) {

        return;
    }

    // typeMeta._prototype.abstract = _class; // deprecated
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function unlinkDecoratorContext(propMeta) {

    delete propMeta.decoratorContext;
}

function unlinkPropMeta(_class, decoratorContext) {

    const {name} = decoratorContext;
    const isStatic = decoratorContext.static;
    const typeMeta = metaOf(_class);
    const typeMetaProtoProperties = isStatic ? typeMeta?.properties : typeMeta?._prototype?.properties;

    if (typeof typeMetaProtoProperties !== 'object') {

        return;
    }

    delete typeMetaProtoProperties[name];
}