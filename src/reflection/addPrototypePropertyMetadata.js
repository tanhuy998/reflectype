const {METADATA, property_metadata_t, metaOf} = require('./metadata.js');
const initMetadata = require('./initMetadata.js');
const initPrototypeMetadata = require('./initPrototypeMetadata.js');

function addPrototypePropertyMetadata(_abstract, prop, meta) {

    if (!Reflect.ownKeys(_abstract.prototype).includes(prop)) {

        return false;
    }
    
    initMetadata(_abstract);

    initPrototypeMetadata(_abstract);

    const {private, type, value} = meta || {};

    const {properties} = metaOf(_abstract).prototype;

    // the property does exist
    if (typeof properties[prop] === 'object') {

        return false;
    }

    const protoProp = new property_metadata_t();

    protoProp.static = false;
    protoProp.value = _abstract[prop];

    properties[prop] = protoProp;

    return true;
}

module.exports = addPrototypePropertyMetadata;