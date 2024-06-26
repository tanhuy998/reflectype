const { METADATA } = require("../../constants");
const { metadata_t, metaOf, prototype_metadata_t, property_metadata_t, wrapperOf, method_variant_map_metadata_t } = require("../../reflection/metadata");
const { extractClassConstructorInfoBaseOnConfig } = require("../../utils/function.util");
const { DECORATED_VALUE } = require("../constant");
const { getMetadataFootPrintByKey, setMetadataFootPrint } = require("../footPrint");
const { isFirstClass } = require("../type");
const { INHERITANCE_DEPTH } = require("./constant");
const { refreshTypeMetaObjectForDecoratorMetadata } = require("./metadataTrace");

const RESOLVED_CLASSES = new Set();

module.exports = {
    resolveTypeMetaResolution,
    recursiveResolveResolution,
};

/**
 *  Metadata resolution
 *  There are two situations that metadata resolution must be evaluated:
 *  - When an instance of a class is instantiated.
 *  - When a reflection reads metadata of a class.
 *  Metadata resolution is evaluated on a class when the first of the above actions occurs.
 * 
 *  when classes inherit another, they would acquire it's base class type meta.
 *  There are no problems when a decorated class inherits another decorated class
 *  because decorators "know" (not yet) which class (exactly decorator metadata context) that
 *  they're placed.
 *  Problems just come when undecorated classes inherit decorated classes.
 *  When we reflect on an undecorated class that inherits decorated class, it's override
 *  properties on base's class decorated properties would be invalid convention.  
 *
 *  Consider this situation:
 *  
 *  class A {
 *      
 *      @returnType(String)
 *      func() {
 *          
 *          return 'foo';
 *      }
 *  }
 * 
 *  class B extends A {
 *      
 *      func() {
 *          
 *          
 *      }
 *  }
 * 
 *  const refl = new ReflectionPrototypeMethod(B, 'func');
 *  
 *  refl.isValid // should be false
 *  refl.returnType // should be undefined
 * 
 *  When metadata resolution progress no in action. Any reflections on method B.func() 
 *  should be considered as invalid reflections, but the result would be a valid reflection 
 *  and the return type of the method that the reflection retrieves from the class's metadata
 *  is [String] because the metadata belongs to class A. 
 * 
 *  Two common types of the problem are:
 *  U <- D <- U   or   D <- U <- D
 *  
 *  => ...U <- ...D <- ...U   or  ...D <- ...U <- ...D 
 */

/**
 * 
 * @param {Function} _class 
 * @returns 
 */
function recursiveResolveResolution(_class) {
    
    if (!needToBeManipulateResolution(_class)) {

        return;
    }
    
    const stack = [];
    
    while (_class !== Object.getPrototypeOf(Function)) {

        if (!needToBeManipulateResolution(_class)) {
            
            break;
        }

        stack.push(_class);
        _class = _class.__proto__;
    }   

    manipulateMetaDependentClasses(stack);
}

function needToBeManipulateResolution(_class) {

    return !RESOLVED_CLASSES.has(_class) &&
            METADATA in _class &&
            metaOf(_class) instanceof metadata_t;
}

function manipulateMetaDependentClasses(stack = []) {

    while (stack.length) {

        const currentClass = stack.pop();

        checkAndReAssignMetaWrapper(currentClass);

        const typeMeta = metaOf(currentClass);
        typeMeta._constructor = extractClassConstructorInfoBaseOnConfig(currentClass);
        
        assignAbstractToTypeMeta(currentClass, typeMeta);
        calculateInheritanceDepth(typeMeta);
        manipulateClass(currentClass, typeMeta)
        //manipulateForMethodVariants(currentClass);
        //unlinkIndependentPropeMeta(currentClass);
        //show(currentClass)
        RESOLVED_CLASSES.add(currentClass);
    }
}

/**
 * 
 * @param {metadata_t} typeMeta 
 */
function calculateInheritanceDepth(typeMeta) {

    const baseClass = Object.getPrototypeOf(typeMeta.abstract);
    const baseDepth = getMetadataFootPrintByKey(metaOf(baseClass), INHERITANCE_DEPTH);

    setMetadataFootPrint(typeMeta, INHERITANCE_DEPTH, baseDepth >= 0 ? baseDepth + 1 : 0);
}

/**
 * 
 * @param {Function|Object} target 
 * @param {metadata_t} typeMeta 
 */
function manipulateClass(target, typeMeta) {
    
    runClassResolutionPlugins(target, typeMeta);
    unlinkIndependentPropeMeta(target);
    runPostClassResolutionPlugins(target, typeMeta);
}

function runPostClassResolutionPlugins(target, typeMeta) {
    
    const plugins = require("./resolutionPlugins/postClassResolutionPlugins");

    for (const plugin of plugins) {

        plugin.call(target, typeMeta);
    }
}

/**
 * 
 * @param {Function|Object} target 
 * @param {metadata_t} typeMeta 
 */
function runClassResolutionPlugins(target, typeMeta) {

    const plugins = require("./resolutionPlugins/classResolutionPlugins");
    
    for (const plugin of plugins) {

        plugin.call(target, typeMeta);
    }
}

function checkAndReAssignMetaWrapper(_class) {

    const typeMeta = metaOf(_class);

    if (typeof typeMeta.loopback === 'object') {

        return;
    }
    /**
     * when metadata_t.loopback is undefined,
     * it means the the metadata_t object belongs to 
     * base class. Therefore, the metadata wrapper of 
     * the current class also belongs to base class
     * and the current clas is undecorated class.
     */
    const baseClassWrapper = wrapperOf(_class);

    Object.defineProperty(_class, METADATA, {
        configurable: true,
        enumerable: true,
        //writable: false,
        value: Object.setPrototypeOf({}, baseClassWrapper)
    })

    refreshTypeMetaObjectForDecoratorMetadata(_class[METADATA], typeMeta);
}

/**
 * This function is used by decorator for the addInitializer()
 * when the decorator know and understand it's class and typeMeta placemnet.
 * 
 * @param {Function} _class
 * @param {metadata_t} _typeMeta 
 */
function assignAbstractToTypeMeta(_class, _typeMeta) {
    
    if (typeof _typeMeta.loopback !== 'object') {

        return;
    } 
    
    _typeMeta.abstract = _class;
    delete _typeMeta.loopback;
}

/**
 * This function is used by decorator for the addInitializer()
 * when the decorator know and understand it's class and typeMeta placemnet.
 * 
 * @param {Function} _class
 * @param {metadata_t} _typeMeta 
 */
function resolveTypeMetaResolution(_class) {

    recursiveResolveResolution(_class);
}

/**
 * Independent propMeta is property_metadata_t object
 * that a class inherited from it base class but the current
 * class override that property without any decorations.
 * 
 * @param {Function} _class 
 */
function unlinkIndependentPropeMeta(_class) {
    
    scanAndResolveStaticProperties(_class);
    scanAndResolvePrototypeProperties(_class);
}

function scanAndResolveStaticProperties(_class) {

    const meta = metaOf(_class);
    manipulateProperties(_class, meta);
}

function scanAndResolvePrototypeProperties(_class) {

    const meta = metaOf(_class)?._prototype;
    
    manipulateProperties(_class.prototype, meta);
}

/**
 * 
 * @param {Function} _class 
 * @param {metadata_t | prototype_metadata_t} meta 
 */
function manipulateProperties(_target, meta) {

    const properties = meta.properties;
    const propertyResolutionPlugins = require('./resolutionPlugins/propertyResolutionPlugins');
    
    for (const [propName, propMeta] of Object.entries(properties) || []) {
        
        if (
            //!isMethodOverridedWithoutDecorattion.call(_target, propName, propMeta) &&
            //!isAttributeOverridedWithoutDecoration.call(
            isAttributeOverridedWithoutDecoration.call(
                _target, 
                propName, 
                propMeta,
                meta.constructor === metadata_t ? meta : meta.owner.typeMeta
            )
        ) {
            delete properties[propName];
            //continue;
        }

        // unlink the propMeta
        // delete properties[propName];

        for (const plugin of propertyResolutionPlugins || []) {
            
            plugin.call(_target, propName, propMeta);
        }
    }
}

/**
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 * @param {metadata_t} referencTypeMeta 
 * 
 * @this Function|Object
 * 
 * @returns 
 */
function isAttributeOverridedWithoutDecoration(propName, propMeta, referencTypeMeta) {

    return !propMeta.isMethod &&
            Reflect.ownKeys(this).includes(propName) &&
            propMeta.owner.typeMeta !== referencTypeMeta;
}

/**
 * This method must be bound with the class or the class's
 * prototype object in order to compare private methods.
 * 
 * @param {string|symbol} methodName 
 * @param {property_metadata_t} propMeta 
 * 
 * @this Function|Object is the class or the class's prototype
 * 
 * @returns 
 */
function isMethodOverridedWithoutDecorattion(methodName, propMeta) {

    if (
        !propMeta.isMethod ||
        typeof this[methodName] !== 'function'
    ) {

        return false;
    }

    const ownerPropMetaClass = propMeta.owner?.typeMeta?.abstract;

    return  this !== ownerPropMetaClass &&
            this !== ownerPropMetaClass.prototype &&
            this[methodName] !== getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}