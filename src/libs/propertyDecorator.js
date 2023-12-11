const { metaOf, METADATA, TYPE_JS, metadata_t, property_metadata_t } = require("../reflection/metadata");
const {decorateMethod, resolveMethodTypeMeta} = require('./methodDecorator.js');
const {resolveAccessorTypeMetadata} = require('./accessorDecorator.js');
const initTypeMetaFootPrint = require('./initFootPrint.js');
const { traceAndInitContextMetadata } = require("./metadata/metadataTrace.js");


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
    const propMeta = resolvePropMeta(_context);
    
    initTypeMetaFootPrint(propMeta);

    switch(kind) {
        case 'method':
            return resolveMethodTypeMeta(_, propMeta);
        case 'accessor':
            return resolveAccessorTypeMetadata(_, propMeta);
        default:
            return propMeta;
    }
}

function resolvePropMeta(_context) {

    const {name, metadata} = _context;
    const propMeta = traceAndInitContextMetadata(_context);

    propMeta.static = _context.static;
    propMeta.private = _context.private;
    propMeta.name = name;
    
    return propMeta;
}


function outerMetadataExist(context) {
    Symbol
    const hasAppliedMetadataDecorator = typeof metadataDecorator.current() === 'object';

    if (hasAppliedMetadataDecorator) {

        return true;
    }

    return (Symbol.metadata !== undefined || Symbol.metadata !== null) && typeof context.metadata === 'object';
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * @param {string || Symbol} _decorator
 * @returns 
 */
function hasFootPrint(propMeta, _decorator) {

    //const propMeta = getTypeMetadataIn(prop, _context);
    
    return typeof propMeta === 'object' && propMeta.footPrint[_decorator] === true;
}

module.exports = {initMetadata, outerMetadataExist, getMetadataOf, hasFootPrint};