const {METADATA, property_metadata_t, metaOf} = require('./metadata.js');
const initMetadata = require('./initMetadata.js');

/**
 * 
 * @param {Function} _abstract 
 * @param {string || Symbol} prop 
 * @param {Object} meta
 * 
 * @returns {boolean} 
 */
function addPropertyMetadata(_abstract, prop, meta) {

    if (!Reflect.ownKeys(_abstract).includes(prop)) {

        return false;
    }

    initMetadata(_abstract);

    const {properties} = metaOf(_abstract);

    const {private, type, value} = meta || {};

    /** when the property exist */
    if (typeof properties[prop] === 'object') {

        return false;
    }

    const propMeta = new property_metadata_t();

    propMeta.static = true;
    propMeta.value = _abstract[prop];

    properties[prop] = propMeta;

    return true;
}

module.exports = addPropertyMetadata;