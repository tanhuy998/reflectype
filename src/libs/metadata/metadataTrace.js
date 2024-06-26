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
 *  @type decorator would throw "cannot apply @type multiple times" ercurrentPropMetaror.
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


const { property_metadata_t, metadata_t, TYPE_JS, metaOf, wrapperOf } = require('../../reflection/metadata.js');
const { FOOTPRINT } = require('../constant.js');
const { ORIGIN, LEGACY_PROP_META } = require('./constant.js');
const {classStack, propStack, globalStack} = require('./initialStack.js');

module.exports = {
    retrieveTypeMetadata,
    currentPropMeta, 
    currentClassMeta, 
    traceAndInitContextMetadata,
    refreshTypeMetadata,
    retrievePropMeta,
    retrieveTypeMetaProperties,
    belongsToCurrentMetadataSession,
    retrieveMetaObject,
    refreshTypeMetaObjectForDecoratorMetadata,
    refreshClassTypeMetadata,
    getLegacyPropMetaOf,
}

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

    globalStack.push(propMeta);
    return propStack.push(propMeta)
}

/**
 *      
 * 
 * @param {Object} decoratorContext 
 * @returns 
 */
function traceAndInitContextMetadata(_, decoratorContext) {

    refreshTypeMetadata(_, decoratorContext);
    const propMeta = resolvePropMeta(_, decoratorContext);
    refreshDecoratorMetadataSession(decoratorContext);
    
    return propMeta;
}

function resolvePropMeta(_, decoratorContext) {

    const {name, metadata} = decoratorContext;
    const properties = retrieveTypeMetaProperties(_, decoratorContext);
    /**@type {metadata_t} */
    const typeMeta = metadata[TYPE_JS];
    let propMeta = properties[name];

    if (noPropMetaOrSubClassOverride(_, decoratorContext)) {
        
        const legacy = propMeta;

        propMeta = properties[name] = new property_metadata_t(undefined, typeMeta);
        propMeta.owner = typeMeta.loopback;
        
        placeLegacyPropMeta(propMeta, legacy);
        registerPropMeta(propMeta);
    }
    
    return propMeta;
}

function retrieveTypeMetaProperties(_, decoratorContext) {

    const {metadata} = decoratorContext;
    /**@type {metadata_t} */
    const refreshedTypeMeta = metadata[TYPE_JS];

    try {
        return decoratorContext.static ? refreshedTypeMeta.properties :
            refreshedTypeMeta._prototype.properties;
    }
    catch {

        throw new Error('there is no type metadata on this context');
    }
}

/**
 * 
 * @param {any} _ 
 * @param {Object} decoratorContext 
 * @returns {property_metadata_t}
 */
function retrievePropMeta(_, decoratorContext) {

    const {name} = decoratorContext;
    const properties = retrieveTypeMetaProperties(_, decoratorContext);

    return properties[name];
}

/**
 * Refresh the derator metadata session when the subclass reaches first property decorator
 * 
 * @param {Object} decoraotorContext 
 */
function refreshDecoratorMetadataSession(decoraotorContext) {
    
    const {metadata} = decoraotorContext;

    if (isSubclassFirstDecorator(decoraotorContext)) {

        metadata[ORIGIN] = metadata;
    }
}

/**
 * Detect whether or not subclass decorator overriden.
 * Otherwise, check for the existence of propMeta on the property which is decorated by a decorator
 * 
 * @param {any} _
 * @param {Object} decoratorContext 
 * 
 * @returns {boolean}
 */
function noPropMetaOrSubClassOverride(_, decoratorContext) {
    
    if (isSubclassFirstDecorator(decoratorContext)) {
        /**
         *  when a subclass reaches it's first decorator,
         *  just create new propMeta no matter what the existence of propMeta
         *  on the property which is the decorator takes effect.
         */
        return true;        
    }

    const propMeta = retrievePropMeta(_, decoratorContext);
    
    if (!(propMeta instanceof property_metadata_t)) {
        /**
         * when the property meta haven't exist yet, it's mean this is the first decorator,
         * just instantiate new one
         */
        return true;
    }

    if (
        propStack.exist(propMeta) &&
        propStack.head !== propMeta
    ) {
        /**
         * When the existed propMeta on the current decorator context is on top of the stack,
         * it means the current decorator are placed after a previous decorator on the same
         * class's property.
         */
        return true;
    }
    
    return false;
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * @param {property_metadata_t} legacyPropMeta
 */
function placeLegacyPropMeta(propMeta, legacyPropMeta) {

    if (
        !(legacyPropMeta instanceof property_metadata_t) ||
        legacyPropMeta === propMeta
    ) {

        return;
    }

    propMeta[FOOTPRINT] ||= {};
    propMeta[FOOTPRINT][LEGACY_PROP_META] = legacyPropMeta;
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function getLegacyPropMetaOf(propMeta) {

    return  propMeta[FOOTPRINT]?.[LEGACY_PROP_META];
}

/**
 * 
 * @param {Function|Object} _ 
 * @param {Object} decoratorContext 
 * @returns 
 */
function refreshTypeMetadata(_, decoratorContext) {

    if (!isSubclassFirstDecorator(decoratorContext)) {

        return metaOf(decoratorContext);
    }

    const {kind, metadata} = decoratorContext;
    /**@type {metadata_t} */
    const oldTypeMeta = metadata[TYPE_JS];

    if (kind === 'class' && oldTypeMeta?.abstract === _) {
        /**
         * When typeMeta.abstract is setted as the current class, it means that
         * this class was apllied by another decorator and the typeMeta not need to be refreshed.
         */
        return oldTypeMeta;
    }

    //const newTypeMeta = metadata[TYPE_JS] = new metadata_t(undefined, oldTypeMeta);
    const newTypeMeta = refreshTypeMetaObjectForDecoratorMetadata(metadata, oldTypeMeta);
    newTypeMeta.loopback.decoratorContext = decoratorContext;

    if (kind === 'class') {

        newTypeMeta.abstract = _;
    }

    newTypeMeta._prototype.owner = newTypeMeta.loopback;
    registerTypeMeta(newTypeMeta);
    return newTypeMeta;
}

function refreshClassTypeMetadata(_class) {

    const wrapper = wrapperOf(_class);
    refreshTypeMetaObjectForDecoratorMetadata(wrapper);
}

/**
 * 
 * @param {Object} decoratorMetadata 
 */
function refreshTypeMetaObjectForDecoratorMetadata(decoratorMetadata, oldTypeMeta) {

    if (typeof decoratorMetadata !== 'object') {

        throw new TypeError('decoratorMetadata must be an object');
    }

    const newTypeMeta = decoratorMetadata[TYPE_JS] = new metadata_t(undefined, oldTypeMeta);
    newTypeMeta.loopback.typeMeta = newTypeMeta;

    return newTypeMeta;
}

/**
 * 
 * @param {metadata_t} _typeMeta 
 */
function registerTypeMeta(_typeMeta) {

    globalStack.push(_typeMeta);
    classStack.push(_typeMeta);
}

/**
 * 
 * @param {Object} decoraotorContext 
 * @returns 
 */
function isSubclassFirstDecorator(decoraotorContext) {

    const {metadata} = decoraotorContext;

    return metadata[ORIGIN] !== metadata;
}

function belongsToCurrentMetadataSession(decoraotorContext) {

    const {metadata} = decoraotorContext;

    return metadata[ORIGIN] === metadata;
}

function retrieveMetaObject(_, decoratorContext) {

    const {kind, metadata} = decoratorContext;
    const typeMeta = metadata[TYPE_JS];

    if (kind === 'class') {

        return typeMeta;
    }

    return retrievePropMeta(_, decoratorContext);
}

/**
 * 
 * @param {any} _ 
 * @param {Object} decoratorContext 
 * @returns {metadata_t}
 */
function retrieveTypeMetadata(_, decoratorContext) {

    return decoratorContext?.metadata?.[TYPE_JS];
}

