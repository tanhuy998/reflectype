const isAbstract = require('../utils/isAbstract.js');
const {metaOf} = require('../reflection/metadata.js');
const ReflectorContext = require('./reflectorContext.js');

/**
 * this file define macros for Property reflectors that is called in context of a property reflector
 */

/**
 * @typedef {import("./reflectionProperty.js")} ReflectionProperty
 * @typedef {import("./reflectionPrototypeProperty")} ReflectionPrototypeProperty
 * @typedef {ReflectionProperty|ReflectionPrototypeProperty} PropertyReflector
 */

/**
 * macro function 
 * 
 * @param {string | Symbol} prop 
 * @returns 
 * 
 * @this PropertyReflector
 */
function resolvePropertyMetadata(prop) {

    const targetIsClass = this.reflectionContext === ReflectorContext.ABSTRACT;

    /**@type {metadata_t} */
    const contextMetadata = (targetIsClass) ? this.metadata : this.metadata?.prototype;

    /**@type {property_metadata_t} */
    let propMeta = contextMetadata?.properties;

    return contextMetadata?.properties[prop] || getMetadataFromProp.call(this, prop);

    // if (typeof contextMetadata !== 'object') {

    //     return getMetadataFromProp.call(this, prop);
    // }
    // else {
        
    //     return contextMetadata?.properties[prop] || getMetadataFromProp.call(this, prop);
    // }
}

/**
 * 
 * @param {*} prop 
 * @returns 
 * 
 * @this PropertyReflector
 */
function getMetadataFromProp(prop) {
    
    const targetIsClass = this.reflectionContext === ReflectorContext.ABSTRACT;

    const targetAbstract = this.originClass;

    const propInstance = (targetIsClass) ? targetAbstract[prop] : targetAbstract.prototype[prop];

    return metaOf(propInstance);
}

/**
 * 
 * @param {*} _state 
 * 
 * @this PropertyReflector
 */
function checkPropertyDescriptorState(_state) {

    const obj = this.reflectionContext !== ReflectorContext.OTHER ? 
            this.reflectionContext === ReflectorContext.ABSTRACT ? this.originClass : this.originClass.prototype
            : undefined;

    const descriptor = Object.getOwnPropertyDescriptor(obj, this.name);

    console.log('has descriptor', descriptor)

   return descriptor ? descriptor[_state] || false : false;
}

module.exports = {resolvePropertyMetadata, checkPropertyDescriptorState};