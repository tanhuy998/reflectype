const { metaOf, METADATA, TYPE_JS, metadata_t, property_metadata_t } = require("../reflection/metadata");
const {decorateMethod, resolveMethodTypeMeta} = require('./methodDecorator.js');
const {resolveAccessorTypeMetadata} = require('./accessorDecorator.js');
const initTypeMetaFootPrint = require('./initFootPrint.js');

function getTypeMetadataIn(target, _context) {

    const {access, kind, name} = _context;

    if (outerMetadataExist(_context) && _context.metadata[TYPE_JS]) {

        return _context.metadata[TYPE_JS][name];
    }
    else {

        let theProp;

        switch(kind) {

            case 'method': 
                theProp = access.get();
            case 'accessor':
                theProp = target.get;
        }

        return metaOf(theProp);
    }
    //return outerMetadataExist(_context) ? _context.metadata[TYPE_JS] : metaOf(theProp);
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

    let wrapperMetadata;

    // outerMetadata means that the TC39 decorator metadata proposal has been approved
    // then we can get the class[Symbol.metadata] inside context of property decorators
    if (outerMetadataExist(_context)) {

        wrapperMetadata = _context.metadata;
    }
    else {
        // if TC39 decorator metadata proposal not present, just assign a substitution object
        // to _context.metadata

        //wrapperMetadata = {};

        _context.metadata = wrapperMetadata = {};
    }

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

    wrapperMetadata[TYPE_JS] ??= new metadata_t();

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

module.exports = {getTypeMetadataIn, initMetadata, outerMetadataExist, getMetadataOf, hasFootPrint};