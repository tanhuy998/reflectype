const isAbstract = require('../../utils/isAbstract.js');
const {metaOf, property_metadata_t} = require('../../reflection/metadata.js');
const ReflectorContext = require('../reflectorContext.js');
const { resolveResolutionFromArbitrayMeta } = require('../../reflection/typeMetadataAction.js');
const { isObject } = require('../../libs/type.js');

/**
 * this file define macros functions for Property reflectors that is called in context of a property reflector
 */

/**
 * @typedef {import('../reflection.js')} Reflection
 * @typedef {import('../../reflection/metadata.js').property_metadata_t} property_metadata_t
 */

module.exports = {
    resolvePropertyMetadata, 
    checkPropertyDescriptorState,  
    getOwnerClass
};

/**
 * macro function 
 * 
 * @param {string | Symbol} prop 
 * @returns 
 * 
 * @this Reflection
 */
function resolvePropertyMetadata(prop) {

    const isInstanceContext = this.reflectionContext === ReflectorContext.INSTANCE;
    /**@type {metadata_t} */
    const contextMetadata = (isInstanceContext) ? this.metadata?._prototype : this.metadata;

    return contextMetadata?.properties[prop] || getMetadataFromProp.call(this, prop);
}

/**
 * 
 * @param {*} prop 
 * @returns 
 * 
 * @this Reflection
 */
function getMetadataFromProp(prop) {

    const isFocusOnPrototype = [ReflectorContext.INSTANCE, ReflectorContext.PROTOTYPE].includes(this.reflectionContext);
    const targetAbstract = this.originClass;
    const propInstance = (isFocusOnPrototype) ? targetAbstract.prototype[prop] : targetAbstract[prop];

    return metaOf(propInstance);
}

/**
 * 
 * @param {*} _state 
 * 
 * @this Reflection
 */
function checkPropertyDescriptorState(_state) {

    const obj = this.reflectionContext !== ReflectorContext.OTHER ? 
            this.reflectionContext === ReflectorContext.ABSTRACT ? this.originClass : this.originClass.prototype
            : undefined;

    const descriptor = Object.getOwnPropertyDescriptor(obj, this.name);

    //console.log('has descriptor', descriptor)

   return descriptor ? descriptor[_state] || false : false;
}


/**
 * @this Reflection
 */
function getOwnerClass() {

    if (!this.isValidReflection) {

        return false;
    }

    const propMeta = this.metadata;

    if (!(propMeta instanceof property_metadata_t)) {

        throw new TypeError('invalid type of refleftion to resolve property\'s origin');
    }

    return propMeta?.owner?.typeMeta?.abstract;
}