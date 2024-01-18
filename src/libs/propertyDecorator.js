const {METADATA, property_metadata_t } = require("../reflection/metadata");
const {decorateMethod, refreshMeta} = require('./methodDecorator.js');
const {decorateAccessor} = require('./accessorDecorator.js');
const {initDecoratorFootPrint, decoratorHasFootPrint, setDecoratorFootPrint, retrieveDecoratorFootPrintByKey, setMetadataFootPrint} = require('./footPrint.js');
const { traceAndInitContextMetadata } = require("./metadata/metadataTrace.js");
const { DECORATED, FOOTPRINT, DECORATED_VALUE, ORIGIN_VALUE } = require("./constant.js");
const { initConstructorMetadata } = require("./decoratorGeneral.js");
const { pseudo_decorator_context_t, pseudo_parameter_decorator_context_t } = require("../utils/pseudoDecorator.js");

const PSEUDO_DECORATION = '_pseudo_decoration';

module.exports = {
    initMetadata, 
    getMetadataOf, 
    getDecoratedValue,
    refreshPropMeta,
};

function refreshPropMeta(propMeta) {

    refreshMeta(propMeta);
}

/**
 * 
 * @param {*} _obj 
 * @returns 
 */
function getMetadataOf(_obj) {

    if (_obj instanceof Object) {

        return _obj[METADATA];
    }
}

// 
/**
 * if wrapper metadata is not set, set wrapper first and then set the TYPE_JS inside it
 * 
 * @param {any} _
 * @param {pseudo_decorator_context_t|pseudo_parameter_decorator_context_t} _context 
 * @returns {property_metadata_t}
 */
function initMetadata(_, _context) {
    
    if (_context.kind === 'parameter') {

        return initPropMetaForParameterDecorator(_, _context);
    }

    const propMeta = resolvePropMeta(_, _context);

    initDecoratorFootPrint(_, _context);
    initConstructorMetadata(_, _context);

    if (decoratorHasFootPrint(_, _context, DECORATED)) {
        
        return propMeta;
    }

    decorate(_, _context, propMeta);
    setDecoratorFootPrint(_, _context, DECORATED);

    return propMeta;
}

/**
 * 
 * @param {any} _ 
 * @param {pseudo_parameter_decorator_context_t} _context 
 * @returns {property_metadata_t}
 */
function initPropMetaForParameterDecorator(_, _context) {
    /**
     *  property decorator will initialize if there were no propMeta placed 
     *  in the cuurent class. Property decorator does not decorates the propMeta
     *  in this case because parameter decorators do not have enough information
     *  about the method for the property decoration.
     */
    const pseudoPropContext = new pseudo_decorator_context_t();
    const actualContextFunc = _context.function;

    pseudoPropContext.addInitializer = _context.addInitializer;
    pseudoPropContext.metadata = _context.metadata;
    pseudoPropContext.kind = actualContextFunc.kind;
    pseudoPropContext.static = actualContextFunc.static;
    pseudoPropContext.private = actualContextFunc.private;
    pseudoPropContext.name = actualContextFunc.name;

    return resolvePropMeta(_, pseudoPropContext);
}

/**
 * 
 * @param {any} _ 
 * @param {pseudo_decorator_context_t} context 
 * @param {property_metadata_t} propMeta 
 * @returns 
 */
function decorate(_, context, propMeta) {

    const {kind} = context;

    if (!decoratorHasFootPrint(_, context, ORIGIN_VALUE)) {
        
        setDecoratorFootPrint(_, context, ORIGIN_VALUE, _);
    }

    switch(kind) {
        case 'method':
            decorateMethod(_, context, propMeta);
            break;
        case 'accessor':
            decorateAccessor(_, context, propMeta);
            break;
        default:
            return;
    }
}

/**
 * 
 * @param {any} _ 
 * @param {pseudo_decorator_context_t} _context 
 * @returns {property_metadata_t}
 */
function resolvePropMeta(_, _context) {

    const propMeta = traceAndInitContextMetadata(_, _context);
    standadizePropMeta(propMeta, _context);
    
    return propMeta;
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * @param {pseudo_decorator_context_t} decoratorContext 
 */
function standadizePropMeta(propMeta, decoratorContext) {

    propMeta.name ??= decoratorContext.name;
    propMeta.private ??= decoratorContext.private;
    propMeta.static ??= decoratorContext.static;
    propMeta.isMethod ??= decoratorContext.kind === 'method'? true : false;
    propMeta.allowNull ??= undefined;
}

/**
 * 
 * @param {property_metadata_t} _propMeta 
 */
function getDecoratedValue(_propMeta) {

    if (typeof _propMeta !== 'object') {

        return undefined;
    }

    if (FOOTPRINT in _propMeta && DECORATED_VALUE in _propMeta[FOOTPRINT]) {

        return _propMeta[FOOTPRINT][DECORATED_VALUE];
    }

    return undefined;
}