const isAbstract = require('../utils/isAbstract.js');
const {metaOf} = require('../reflection/metadata.js');

/**
 * this file define macros for Property reflectors that is called in context of a property reflector
 */


/**
 * macro function 
 *  
 * @param {string | Symbol} prop 
 * @returns 
 */
function resolvePropertyMetadata(prop) {

    const targetIsClass = isAbstract(this.target);

    /**@type {metadata_t} */
    const contextMetadata = (targetIsClass) ? this.metadata : this.metadata?.prototype;

    /**@type {property_metadata_t} */
    let propMeta;

    return contextMetadata?.properties[prop] || getMetadataFromProp.call(this, prop);

    // if (typeof contextMetadata !== 'object') {

    //     return getMetadataFromProp.call(this, prop);
    // }
    // else {
        
    //     return contextMetadata?.properties[prop] || getMetadataFromProp.call(this, prop);
    // }
}

function getMetadataFromProp(prop) {

    const targetIsClass = isAbstract(this.target);

    const targetAbstract = this.originClass;

    const propInstance = (targetIsClass) ? targetAbstract[prop] : targetAbstract.prototype[prop];

    return metaOf(propInstance);
}

module.exports = {resolvePropertyMetadata};