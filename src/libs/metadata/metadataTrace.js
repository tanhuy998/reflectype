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
const { hasFootPrint } = require('../footPrint.js');
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
 * 
 * @param {Object} decoratorContext 
 * @returns 
 */
function traceAndInitContextMetadata(_, decoratorContext) {

    const {name} = decoratorContext;
    const refreshedTypeMeta = refreshTypeMetadata(_, decoratorContext);

    let propMeta = refreshedTypeMeta.properties[name];

    if (noPropMetaOrSubClassOverride(_, decoratorContext)) {
        
        propMeta = refreshedTypeMeta.properties[name] = new property_metadata_t();

        registerPropMeta(propMeta);
    }

    return propMeta;
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function noPropMetaOrSubClassOverride(_, decoratorContext) {

    const {name, metadata} = decoratorContext;
    const typeMeta = metadata[TYPE_JS];

    const propMeta = typeMeta?.properties[name];

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
    if (propStack.exist(propMeta) && 
    !hasFootPrint(_, decoratorContext)) {
    
        return true;
    }
    
    return false;
}

/**
 * 
 * @param {Function|Object} _ 
 * @param {Object} decoratorContext 
 * @returns 
 */
function refreshTypeMetadata(_, decoratorContext) {

    const {kind, metadata} = decoratorContext;
    /**@type {metadata_t} */
    const oldTypeMeta = metadata[TYPE_JS];

    if (kind === 'class' && oldTypeMeta?.abstract === _) {

        return;
    }

    // refresh metadata_t first
    const newTypeMeta = metadata[TYPE_JS] = new metadata_t(undefined, oldTypeMeta);

    if (kind === 'class') {

        newTypeMeta.abstract = _;
    }

    return newTypeMeta;
}

module.exports = {
    currentPropMeta, 
    currentClassMeta, 
    traceAndInitContextMetadata,
    refreshTypeMetadata,
}

