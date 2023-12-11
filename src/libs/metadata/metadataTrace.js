/**
 *  Implementation for initiation of property_metadata_t on each class prototype's property.
 *  When Decorator metadata on function to the next released version of babel, there are no 
 *  build-in technique to detect the the class of the property where property decorators are held.
 *  Therefore, the definition of initialStack is here for property decorators to determine the state
 *  of the current property.
 *  Consider the following illutration:
 *  
 *  class A {
 *      
 *      @type(Number)
 *      accessor prop; 
 *  }
 * 
 *  class B extends A {
 *      
 *      @type(String)
 *      accessor prop;
 *  }
 * 
 *  @type decorator would throw "cannot apply @type multiple times" error.
 * 
 *  Class A'prototype define a property named "prop" as type of Number, then B extends and overrides it with 
 *  type of String. Decorator Metadata descriptions mentioned that subclass metadata field will inherits it's
 *  base class metadata field. When accessing a metadata's member, the subclass could not know the accessed member
 *  are the property of the base class or itself, and when a decorator detects it existence on the overrided property,
 *  it looks on the property_metadata_t of the base class, not the subclasss.
 * 
 *  The approach for this issue here is, when a property decorator tackes effect on a class prototype property, it instantiates 
 *  a new metadata_t that is the shallow copy of the existed metadata_t on this property. This action will cause a metadata_t fresh 
 *  instantiation on subclass and hence, depends on the propStack (the stack that holds the initiation of all porpety_metadata_t object),
 *  property decorators could detect the grade of the current property_metadata_t instance it belongs to (decorator just know the property_metadata_t
 *  belongs to subclass or base class, could not detect grand parent class).
 */


const { property_metadata_t, metadata_t, TYPE_JS } = require('../../reflection/metadata.js');
const {classStack, propStack} = require('./initialStack.js');

function currentClassMeta() {
    
    return classStack.head;
}

function currentPropMeta() {

    return propStack.head;
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * @throws
 */
function registerPropMeta(propMeta) {

    return propStack.push(propMeta)
}

/**
 * 
 * @param {metadata_t} classMeta 
 * @throws
 */
function registerClassMeta(classMeta) {

    return classStack.push(classMeta);
}

/**
 *      
 * 
 * @param {Object} decoratorContext 
 * @returns 
 */
function traceAndInitContextMetadata(decoratorContext) {

    const {kind, name, metadata} = decoratorContext;
    const typeMeta = new metadata_t(undefined, metadata[TYPE_JS]);
    const propMeta = typeMeta.properties[name];

    if (noPropMetaOrSubClassOverride(propMeta)) {

        const newPropMeta = typeMeta.properties[name] = new property_metadata_t();

        registerPropMeta(newPropMeta);

        return newPropMeta;
    }
    else {

        return propMeta;
    }
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function noPropMetaOrSubClassOverride(propMeta) {

    /**
     * when the property meta haven't exist yet, it's mean this is the first decorator,
     * just instantiate new one
     */
    if (!(propMeta instanceof property_metadata_t)) {

        return true;
    }

    /**
     * subclass override the property
     */
    if (propStack.exist(propMeta) && propMeta !== propStack.head) {

        return true;
    }

    return false;
}

/**
 * 
 * @param {string | Symbol} propName
 * @param {metadata_t} classMeta 
 */
function initProp(propName, classMeta) {

    const propMeta = classMeta.properties[propName];

    if (propMeta instanceof property_metadata_t) {


    }
}

module.exports = {

    currentPropMeta, currentClassMeta, traceAndInitContextMetadata
}