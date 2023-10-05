const { metaOf, METADATA } = require("../reflection/metadata");

function getMetadata(_context) {

    const {access, kind} = _context;

    const theProp = kind === 'method' ? access.get() : undefined;

    return outerMetadataExist(_context) ? _context.metadata : metaOf(theProp);
}

// init wrapper metadata to a specific property
function initMetadata(_context) {

    const {access, kind} = _context;

    const theProp = access?.get();

    const isMethod = typeof theProp === 'function' && kind === 'method';

    const meta = {};

    if (outerMetadataExist(_context)) {

        return _context.metadata;
    }

    if (isMethod) {

        theProp[METADATA] ??= meta;

        _context.metadata = theProp[METADATA];

        return _context.metadata;
    } 
    else {

        _context.metadata = meta;

        return meta;
    }
}

function outerMetadataExist(context) {

    return typeof context.metadata === 'object';
}


module.exports = {getMetadata, initMetadata, outerMetadataExist};