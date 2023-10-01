const { metaOf } = require("./metadata");

/**
 * 
 * @param {Object} _abstract 
 * @param {string || Symbol} prop 
 * @returns 
 */
function getPrototypePropertyMeta(_abstract, prop) {

    return metaOf(_abstract)?.prototype;
}

module.exports = getPrototypePropertyMeta;