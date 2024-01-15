const {METADATA, property_metadata_t, metaOf} = require('./metadata.js');
const initMetadata = require('./initMetadata.js');
const initPrototypeMetadata = require('./initPrototypeMetadata.js');

// 
function addPrototypePropertyMetadata(_abstract, prop, meta) {
    
    initMetadata(_abstract);

    initPrototypeMetadata(_abstract);

    const {private, type, value} = meta || {};

    const {properties} = metaOf(_abstract)._prototype;

    // the property does exist
    if (typeof properties[prop] === 'object') {

        return false;
    }

    const protoProp = new property_metadata_t();

    protoProp.static = false;
    protoProp.value = _abstract[prop];
    
    /**
     *  ES6 class's prototype just include method
     */
    protoProp.isMethod = Reflect.ownKeys(_abstract.prototype).includes(prop) && typeof _abstract.prototype[prop] === 'function';

    properties[prop] = protoProp;

    return true;
}

module.exports = addPrototypePropertyMetadata;