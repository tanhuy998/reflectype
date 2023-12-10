const { metaOf, METADATA, TYPE_JS, metadata_t, property_metadata_t } = require("../reflection/metadata");
const {decorateMethod, resolveMethodTypeMeta} = require('./methodDecorator.js');
const {resolveAccessorTypeMetadata} = require('./accessorDecorator.js');
const initTypeMetaFootPrint = require('./initFootPrint.js');

//const metadataDecorator = require('./metadataDecorator.js');
const GlobalMetadataType = require("./globalMetadataType.js");

function resolveGlobalMetadata(target, _context) {

    const {access, kind, name} = _context;

    const globalType = GlobalMetadataType.OFFICIAL;

    /**@type {Object} */
    let metaWrapper;

    /**
     * emulating the TC39-proposal decorator metadata
     */
    switch (globalType) {
        case GlobalMetadataType.VIRTUAL:
            metaWrapper = _context.metadata = outerMetadataExist(_context) ? metadataDecorator.current() : {};
            break;
        case GlobalMetadataType.OFFICIAL:
            metaWrapper = _context.metadata;
            break;
    }

    metaWrapper[TYPE_JS] = metaWrapper[TYPE_JS] instanceof metadata_t ? metaWrapper[TYPE_JS] : new metadata_t();
}

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
function initMetadata(_object, _context) {

    const {kind} = _context;

    //const isMethod = typeof theProp === 'function' && kind === 'method';

    resolveGlobalMetadata(_object, _context)

    const wrapperMetadata = _context.metadata;


    // // outerMetadata means that the TC39 decorator metadata proposal has been approved
    // // then we can get the class[Symbol.metadata] inside context of property decorators
    // if (outerMetadataExist(_context)) {

    //     wrapperMetadata = _context.metadata;
    // }
    // else {
    //     // if TC39 decorator metadata proposal not present, just assign a substitution object
    //     // to _context.metadata

    //     //wrapperMetadata = {};

    //     _context.metadata = wrapperMetadata = {};
    // }

    const propMeta = resolvePropMeta(wrapperMetadata, _context);
    
    initTypeMetaFootPrint(propMeta);

    if (kind === 'method') {

        return resolveMethodTypeMeta(_object, propMeta);
    } 

    if (kind === 'accessor') {

        return resolveAccessorTypeMetadata(_object, propMeta);
    }

    return propMeta;
}

function resolvePropMeta(wrapperMetadata, _context) {

    const {name} = _context;

    //wrapperMetadata[TYPE_JS] ??= new metadata_t();

    const classMeta = wrapperMetadata[TYPE_JS];

    classMeta.properties ??= {};

    classMeta.properties[name] ??= new property_metadata_t();

    /**@type {property_metadata_t} */
    const propMeta = classMeta.properties[name];

    propMeta.static = _context.static;
    propMeta.private = _context.private;
    propMeta.name = name;

    return propMeta;
}


function outerMetadataExist(context) {

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