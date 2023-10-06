const { metaOf, METADATA, TYPE_JS, metadata_t, property_metadata_t } = require("../reflection/metadata");

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
function initMetadata(_context) {

    const {access, kind, name} = _context;

    //const isMethod = typeof theProp === 'function' && kind === 'method';

    let wrapperMetadata;

    // outerMetadata means that the decorator metadata proposal has been approved
    // then we can get the class[Symbol.metadata] inside context of property decorators
    if (outerMetadataExist(_context)) {

        wrapperMetadata = _context.metadata;
    }
    else {

        wrapperMetadata = {};

        _context.metadata = wrapperMetadata;
    }

    wrapperMetadata[TYPE_JS] ??= new metadata_t();

    const classMeta = wrapperMetadata[TYPE_JS];

    classMeta.properties ??= {};

    classMeta.properties[name] ??= new property_metadata_t();

    /**@type {property_metadata_t} */
    const propMeta = classMeta.properties[name];

    propMeta.static = _context.static;
    propMeta.private = _context.private;
    propMeta.name = name;

    if (kind === 'method') {

        const theProp = access?.get();

        theProp[METADATA] ??= {};

        theProp[METADATA][TYPE_JS] ??= propMeta;

        metaOf(theProp).isMethod = true;

        return metaOf(theProp);
    } 
    // else {

    //     _context.metadata = meta;

    //     return meta;
    // }

    return propMeta;
}

function outerMetadataExist(context) {

    return (Symbol.metadata !== undefined || Symbol.metadata !== null) && typeof context.metadata === 'object';
}


module.exports = {getTypeMetadataIn, initMetadata, outerMetadataExist, getMetadataOf};