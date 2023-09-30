const { metaOf } = require("./metadata");

/**
 * 
 * @param {Object} _abstract 
 * @param {string || Symbol} prop 
 * @returns 
 */
function getPropertyMeta(_abstract, prop) {

    return metaOf(_abstract)?.properties[prop];
}

module.exports = getPropertyMeta;