/**
 * 
 * @param {Object} meta 
 * @param {string || Symbol} prop 
 * @returns 
 */
function getPropertyMeta(meta, prop) {

    return meta?.properties[prop];
}