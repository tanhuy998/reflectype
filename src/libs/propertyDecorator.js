const { metaOf, METADATA } = require("../reflection/metadata");

function getMetadata(_context) {

    const {access} = _context;

    const theProp = access.get();

    return outerMetadataExist(_context) ? _context.metadata : metaOf(theProp);
}

// init wrapper metadata to a specific property
function initPropMetadata(_context) {

    const {access, kind} = _context;

    const theProp = access.get();

    const isMethod = typeof theProp === 'function' && kind === 'method';

    const meta = {};

    if (outerMetadataExist(_context)) {

        _context.metadata = meta;

        return meta
    }
    else if (isMethod) {

        theProp[METADATA] ??= meta;

        return meta;
    }
    else {

        return;
    }
}

function outerMetadataExist(context) {

    return typeof context.metadata === 'object';
}


module.exports = {getMetadata, initPropMetadata, outerMetadataExist};