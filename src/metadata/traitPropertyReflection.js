const isAbstract = require('../utils/isAbstract.js');
const {metaOf} = require('../reflection/metadata.js');
const ReflectorContext = require('./reflectorContext.js');

/**
 * this file define macros functions for Property reflectors that is called in context of a property reflector
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

    //const targetIsClass = this.reflectionContext === ReflectorContext.ABSTRACT
    const isInstanceContext = this.reflectionContext === ReflectorContext.INSTANCE;

    /**@type {metadata_t} */
    const contextMetadata = (isInstanceContext) ? this.metadata?.prototype : this.metadata;

    // /**@type {property_metadata_t} */
    // let propMeta = contextMetadata?.properties;

    return contextMetadata?.properties[prop] || getMetadataFromProp.call(this, prop);
}

/**
 * 
 * @param {*} prop 
 * @returns 
 * 
 * @this PropertyReflector
 */
function getMetadataFromProp(prop) {
    
    //const isStatic = this.reflectionContext === ReflectorContext.ABSTRACT;

    const isFocusOnPrototype = [ReflectorContext.INSTANCE, ReflectorContext.PROTOTYPE].includes(this.reflectionContext);

    const targetAbstract = this.originClass;

    const propInstance = (isFocusOnPrototype) ? targetAbstract.prototype[prop] : targetAbstract[prop];

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