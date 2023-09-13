const METADATA = require('./metadata.js');
const initMetadata = require('./initMetadata.js');
const initPrototypeMetadata = require('./initPrototypeMetadata.js');

function addPrototypePropertyMetadata(_abstract) {
    
    initMetadata(_abstract);

    initPrototypeMetadata(_abstract);

    const {properties} = _abstract[METADATA].prototype;

    // the property does exist
    if (typeof properties[prop] === 'object') {

        return false;
    }

    properties[prop] = {
        static: true,
    }

    return true;
}

module.exports = addPrototypePropertyMetadata;