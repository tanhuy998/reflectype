const propertyDecorator = require('../libs/propertyDecorator.js');
const {METADATA, TYPE_JS} = require('../reflection/metadata.js');
const typeMetadata = require('../reflection/metadata.js');

function allowNull(prop, _context) {

    const {kind, name} = _context;

    switch(kind) {

        case 'method':
            return handleMethod(prop, _context);
        case 'accessor':
            return handleAccessor(prop, _context);
        default:
            throw new Error('Decorator @allowNull just applied to auto assessor, add \'accessor\' syntax before the class property');
    }
}

function handleMethod(_method, _context) {

    const propMeta = propertyDecorator.initMetadata(_context);

    propMeta.allowNull = true;

    return _method;
}

function handleAccessor({get, set}, _context) {

    const propMeta = propertyDecorator.outerMetadataExist(_context) ? 
                        propertyDecorator.initMetadata(_context) 
                        : typeMetadata.metaOf(get) || new property_metadata_t();

    get[METADATA] ??= {};
    get[METADATA][TYPE_JS] = propMeta;

    const {private, static, name} = _context;

    propMeta.allowNull = true;
    propMeta.name ??= name;
    propMeta.private ??= private;
    propMeta.static ??= static;
    propMeta.isMethod = false;

    return {
        get, set
    }
}

module.exports = allowNull;
