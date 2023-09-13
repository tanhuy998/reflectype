const METADATA = require('./metadata.js');
const initMetadata = require('./initMetadata.js');

/**
 * 
 * @param {Function} _abstract 
 * @param {string || Symbol} prop 
 * 
 * @returns {boolean} 
 */
function addPropertyMetadata(_abstract, prop) {

    initMetadata(_abstract);

    const {properties} = _abstract[METADATA];

    if (typeof properties[prop] !== 'object') {

        return false;
    }

    properties[prop] = {
        static: true,
    }

    return true;
}

module.exports = addPropertyMetadata;