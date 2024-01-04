const {METADATA, property_metadata_t } = require("../reflection/metadata");
const {decorateMethod} = require('./methodDecorator.js');
const {decorateAccessor} = require('./accessorDecorator.js');
const {initTypeMetaFootPrint, hasFootPrint, setFootPrint, retrieveFootPrintByKey} = require('./footPrint.js');
const { traceAndInitContextMetadata } = require("./metadata/metadataTrace.js");
const { DECORATED, FOOTPRINT, DECORATED_VALUE } = require("./constant.js");


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
 * @param {*} _context 
 * @returns {property_metadata_t}
 */
function initMetadata(_, _context) {
    
    const {kind} = _context;
    const propMeta = resolvePropMeta(_, _context);
    
    initTypeMetaFootPrint(_, _context);
    
    if (hasFootPrint(_, _context, DECORATED)) {
        
        return propMeta;
    }

    switch(kind) {
        case 'method':
            decorateMethod(_, _context, propMeta)
            break;
        case 'accessor':
            decorateAccessor(_, _context, propMeta);
            break;
        default:
            break;
    }

    setFootPrint(_, _context, DECORATED);

    return propMeta;
}

function resolvePropMeta(_, _context) {

    const propMeta = traceAndInitContextMetadata(_, _context);

    propMeta.name = _context.name;
    propMeta.private = _context.private;
    propMeta.static = _context.static;
    propMeta.isMethod = _context.kind === 'method'? true : false;
    propMeta.allowNull = undefined;
    
    return propMeta;
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

module.exports = {initMetadata, getMetadataOf, getDecoratedValue};